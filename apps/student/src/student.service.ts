import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateStudentProfileDto } from '../../libs/dtos/create-student-profile.dto';
import { ClientProxy } from '@nestjs/microservices';

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

    // emit event for auth service to create login credentials for respsective student
    this.authClient.emit('student.created', {
      studentId: student.id,
      fullName: student.fullName,
      dob: student.dob,
      email: student.email
    });

    return student;
  }
}

