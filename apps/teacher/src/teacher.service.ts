import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { ClientProxy } from '@nestjs/microservices';

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
}
