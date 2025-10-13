import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateStudentProfileDto } from '../../libs/dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../../libs/dtos/update-student-profile.dto';
import { QueryStudentsDto } from '../../libs/dtos/query-students.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '../generated/prisma';

@Injectable()
export class StudentService {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private prisma: PrismaService
  ){}

  async createStudentProfile(createStudentProfileDto: CreateStudentProfileDto) {
    const student = await this.prisma.student.create({
      data: createStudentProfileDto,
    });

    // emit event for auth service to create login credentials for respective student
    this.authClient.emit('student.created', {
      studentId: student.id,
      fullName: student.fullName,
      dob: student.dob,
      email: student.email
    });

    return student;
  }

  async getAllStudents(query: QueryStudentsDto) {
    const { page = 1, limit = 10, search, className, section, sortBy = 'createdAt', order = 'desc' } = query;
    
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { class: { contains: search, mode: 'insensitive' } },
        { guardianName: { contains: search, mode: 'insensitive' } },
        { guardianContact: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (className) {
      where.class = { contains: className, mode: 'insensitive' };
    }

    if (section) {
      where.section = { equals: section, mode: 'insensitive' };
    }

    // Build orderBy clause
    const orderBy: Prisma.StudentOrderByWithRelationInput = {
      [sortBy]: order,
    };

    // Get total count for pagination
    const total = await this.prisma.student.count({ where });

    // Get students with pagination
    const students = await this.prisma.student.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async updateStudent(id: string, updateStudentProfileDto: UpdateStudentProfileDto) {
    // Check if student exists
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Update student
    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: updateStudentProfileDto,
    });

    return updatedStudent;
  }

  async deleteStudent(id: string) {
    // Check if student exists
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Delete student
    await this.prisma.student.delete({
      where: { id },
    });

    // Emit event to delete user credentials
    this.authClient.emit('student.deleted', {
      studentId: id,
      email: existingStudent.email,
    });

    return { success: true, message: 'Student deleted successfully' };
  }

  async getStudentStats() {
    const total = await this.prisma.student.count();
    
    const byClass = await this.prisma.student.groupBy({
      by: ['class'],
      _count: true,
    });

    const bySection = await this.prisma.student.groupBy({
      by: ['section'],
      _count: true,
    });

    const byGender = await this.prisma.student.groupBy({
      by: ['gender'],
      _count: true,
    });

    return {
      total,
      byClass,
      bySection,
      byGender,
    };
  }
}

