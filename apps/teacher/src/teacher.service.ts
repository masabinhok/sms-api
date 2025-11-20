import { Inject, Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from 'apps/libs/dtos/update-teacher-profile.dto';
import { QueryTeachersDto } from 'apps/libs/dtos/query-teachers.dto';
import { ClientProxy, ClientKafka } from '@nestjs/microservices';
import { Prisma } from '../generated/prisma';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TeacherService implements OnModuleInit {
  private readonly logger = new Logger(TeacherService.name);
  
  constructor(
    private readonly prisma: PrismaService, 
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('ACADEMICS_SERVICE') private academicsClient: ClientKafka,
    @Inject('ACTIVITY_SERVICE') private activityClient: ClientProxy
  ) {}

  async onModuleInit() {
    // Subscribe to reply topics from academics service
    this.academicsClient.subscribeToResponseOf('class.getById');
    this.academicsClient.subscribeToResponseOf('subject.getById');
    await this.academicsClient.connect();
    this.logger.log('Teacher service connected to academics service');
  }

  async createTeacherProfile(createTeacherProfileDto: CreateTeacherProfileDto) {
    // Validate class IDs if provided
    if (createTeacherProfileDto.classIds && createTeacherProfileDto.classIds.length > 0) {
      for (const classId of createTeacherProfileDto.classIds) {
        try {
          const classResponse = await firstValueFrom(
            this.academicsClient.send('class.getById', { id: classId })
          );
          
          if (!classResponse || !classResponse.class) {
            throw new BadRequestException(`Class with ID ${classId} not found`);
          }
        } catch (error) {
          throw new BadRequestException(`Failed to validate class ${classId}: ${error.message}`);
        }
      }
    }

    // Validate subject IDs if provided
    if (createTeacherProfileDto.subjectIds && createTeacherProfileDto.subjectIds.length > 0) {
      for (const subjectId of createTeacherProfileDto.subjectIds) {
        try {
          const subjectResponse = await firstValueFrom(
            this.academicsClient.send('subject.getById', { id: subjectId })
          );
          
          if (!subjectResponse || !subjectResponse.subject) {
            throw new BadRequestException(`Subject with ID ${subjectId} not found`);
          }
        } catch (error) {
          throw new BadRequestException(`Failed to validate subject ${subjectId}: ${error.message}`);
        }
      }
    }

    // Ensure createdBy is set, throw error if missing
    if (!createTeacherProfileDto.createdBy) {
      throw new BadRequestException('createdBy field is required');
    }

    const teacher = await this.prisma.teacher.create({
      data: {
        fullName: createTeacherProfileDto.fullName,
        email: createTeacherProfileDto.email,
        gender: createTeacherProfileDto.gender,
        phone: createTeacherProfileDto.phone,
        address: createTeacherProfileDto.address,
        dob: createTeacherProfileDto.dob,
        subjectIds: createTeacherProfileDto.subjectIds || [],
        classIds: createTeacherProfileDto.classIds || [],
        createdBy: createTeacherProfileDto.createdBy,
      },
    });

    // emit event for auth service to create login credentials for respective teacher
    this.authClient.emit('teacher.created', {
      email: teacher.email,
      fullName: teacher.fullName,
      teacherId: teacher.id,
      dob: teacher.dob,
    });

    // Log activity - teacher profile created
    this.activityClient.emit('activity.log', {
      userId: createTeacherProfileDto.createdBy,
      userRole: createTeacherProfileDto.createdByRole,
      action: 'CREATE',
      description: `Created teacher profile: ${teacher.fullName} (${teacher.email})`,
      entityType: 'TEACHER',
      entityId: teacher.id,
      metadata: {
        email: teacher.email,
        fullName: teacher.fullName,
        phone: teacher.phone,
        subjectCount: teacher.subjectIds?.length || 0,
        classCount: teacher.classIds?.length || 0,
      },
    });

    return teacher;
  }

  async getAllTeachers(query: QueryTeachersDto) {
    const { page = 1, limit = 10, search, subject, class: className, sortBy = 'createdAt', order = 'desc' } = query;
    
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.TeacherWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subject) {
      where.subjectIds = {
        has: subject
      };
    }

    if (className) {
      where.classIds = {
        has: className
      };
    }

    // Build orderBy clause
    const orderBy: Prisma.TeacherOrderByWithRelationInput = {
      [sortBy]: order,
    };

    // Get total count for pagination
    const total = await this.prisma.teacher.count({ where });

    // Get teachers with pagination
    const teachers = await this.prisma.teacher.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTeacherById(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async updateTeacher(id: string, updateTeacherProfileDto: UpdateTeacherProfileDto, userId: string, userRole: string) {
    // Check if teacher exists
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Update teacher
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data: updateTeacherProfileDto,
    });

    // Log activity - teacher profile updated
    this.activityClient.emit('activity.log', {
      userId: userId,
      userRole: userRole,
      action: 'UPDATE',
      description: `Updated teacher profile: ${updatedTeacher.fullName}`,
      entityType: 'TEACHER',
      entityId: updatedTeacher.id,
      metadata: {
        updates: updateTeacherProfileDto,
      },
    });

    return updatedTeacher;
  }

  async deleteTeacher(id: string, userId: string, userRole: string) {
    // Check if teacher exists
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    // Delete teacher
    await this.prisma.teacher.delete({
      where: { id },
    });

    // Emit event to delete user credentials
    this.authClient.emit('teacher.deleted', {
      teacherId: id,
      email: existingTeacher.email,
    });

    // Log activity - teacher profile deleted
    this.activityClient.emit('activity.log', {
      userId: userId,
      userRole: userRole,
      action: 'DELETE',
      description: `Deleted teacher profile: ${existingTeacher.fullName} (${existingTeacher.email})`,
      entityType: 'TEACHER',
      entityId: id,
      metadata: {
        deletedTeacher: {
          fullName: existingTeacher.fullName,
          email: existingTeacher.email,
          phone: existingTeacher.phone,
        },
      },
    });

    return { success: true, message: 'Teacher deleted successfully' };
  }

  async getTeacherStats() {
    const total = await this.prisma.teacher.count();
    
    // Get all teachers to calculate subject and class statistics
    const teachers = await this.prisma.teacher.findMany({
      select: {
        subjectIds: true,
        classIds: true,
        gender: true,
      },
    });

    // Calculate subject statistics
    const subjectCounts: Record<string, number> = {};
    teachers.forEach(teacher => {
      teacher.subjectIds?.forEach(subjectId => {
        subjectCounts[subjectId] = (subjectCounts[subjectId] || 0) + 1;
      });
    });

    const bySubject = Object.entries(subjectCounts).map(([subjectId, count]) => ({
      subjectId,
      _count: count,
    }));

    // Calculate class statistics
    const classCounts: Record<string, number> = {};
    teachers.forEach(teacher => {
      teacher.classIds?.forEach(classId => {
        classCounts[classId] = (classCounts[classId] || 0) + 1;
      });
    });

    const byClass = Object.entries(classCounts).map(([classId, count]) => ({
      classId,
      _count: count,
    }));

    // Calculate gender statistics
    const byGender = await this.prisma.teacher.groupBy({
      by: ['gender'],
      _count: true,
    });

    return {
      total,
      bySubject,
      byClass,
      byGender,
    };
  }
}
