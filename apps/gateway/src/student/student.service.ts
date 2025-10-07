import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';

@Injectable()
export class StudentService implements OnModuleInit {
  private isClientReady = false;
  
  constructor(@Inject('STUDENT_CLIENT') private studentClient: ClientKafkaProxy){}

  async onModuleInit(){
    try {
      this.studentClient.subscribeToResponseOf('student.createProfile');
      await this.studentClient.connect();
      
      // Wait a bit for subscriptions to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isClientReady = true;
      console.log('Student service client is ready');
    } catch (error) {
      console.error('Failed to initialize student service client:', error);
    }
  }

  async createStudentProfile(createStudentProfileDto: CreateStudentProfileDto){
    return this.studentClient.send('student.createProfile', createStudentProfileDto);
  }
}
