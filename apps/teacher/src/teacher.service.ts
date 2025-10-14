import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from 'apps/libs/dtos/update-teacher-profile.dto';
import { QueryTeachersDto } from 'apps/libs/dtos/query-teachers.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '../generated/prisma';

@Injectable()
export class TeacherService {
  
  constructor(
    private readonly prisma: PrismaService, 
    @Inject('AUTH_SERVICE') private authClient: ClientProxy
  ) {}

  async createTeacherProfile(createTeacherProfileDto: CreateTeacherProfileDto) {
    const teacher = await this.prisma.teacher.create({
      data: createTeacherProfileDto,
    });

    // emit event for auth service to create login credentials for respsective teacher
    this.authClient.emit('teacher.created', {
      email: teacher.email,
      fullName: teacher.fullName,
      teacherId: teacher.id,
      dob: teacher.dob,
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
      where.subjects = {
        has: subject
      };
    }

    if (className) {
      where.classes = {
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

  async updateTeacher(id: string, updateTeacherProfileDto: UpdateTeacherProfileDto) {
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

    return updatedTeacher;
  }

  async deleteTeacher(id: string) {
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

    return { success: true, message: 'Teacher deleted successfully' };
  }

  async getTeacherStats() {
    const total = await this.prisma.teacher.count();
    
    // Get all teachers to calculate subject and class statistics
    const teachers = await this.prisma.teacher.findMany({
      select: {
        subjects: true,
        classes: true,
        gender: true,
      },
    });

    // Calculate subject statistics
    const subjectCounts: Record<string, number> = {};
    teachers.forEach(teacher => {
      teacher.subjects?.forEach(subject => {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
    });

    const bySubject = Object.entries(subjectCounts).map(([subject, count]) => ({
      subject,
      _count: count,
    }));

    // Calculate class statistics
    const classCounts: Record<string, number> = {};
    teachers.forEach(teacher => {
      teacher.classes?.forEach(className => {
        classCounts[className] = (classCounts[className] || 0) + 1;
      });
    });

    const byClass = Object.entries(classCounts).map(([className, count]) => ({
      class: className,
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
