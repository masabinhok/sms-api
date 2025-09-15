import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/shared/dtos/create-teacher-profile.dto';

@Injectable()
export class TeacherService {
  constructor(@Inject('TEACHER_CLIENT') private teacherClient: ClientProxy){}

  async createTeacherProfile(data: CreateTeacherProfileDto) {
    return this.teacherClient.send('teacher.createProfile', data);
  }
}
