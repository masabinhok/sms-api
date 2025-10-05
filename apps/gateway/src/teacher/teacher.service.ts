import { Inject, Injectable } from '@nestjs/common';
import { ClientKafkaProxy,  } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';

@Injectable()
export class TeacherService {
  constructor(@Inject('TEACHER_CLIENT') private teacherClient: ClientKafkaProxy){}

  async onModuleInit(){
    this.teacherClient.subscribeToResponseOf('teacher.createProfile');
    await this.teacherClient.connect();
  }

  async createTeacherProfile(data: CreateTeacherProfileDto) {
    return this.teacherClient.send('teacher.createProfile', data);
  }
}
