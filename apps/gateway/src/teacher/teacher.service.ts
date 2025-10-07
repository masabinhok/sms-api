import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafkaProxy,  } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';

@Injectable()
export class TeacherService implements OnModuleInit {
  private isClientReady = false;
  
  constructor(@Inject('TEACHER_CLIENT') private teacherClient: ClientKafkaProxy){}

  async onModuleInit(){
    try {
      this.teacherClient.subscribeToResponseOf('teacher.createProfile');
      await this.teacherClient.connect();
      
      // Wait a bit for subscriptions to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isClientReady = true;
      console.log('Teacher service client is ready');
    } catch (error) {
      console.error('Failed to initialize teacher service client:', error);
    }
  }

  async createTeacherProfile(data: CreateTeacherProfileDto) {
    return this.teacherClient.send('teacher.createProfile', data);
  }
}
