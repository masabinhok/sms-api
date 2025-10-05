import { Inject, Injectable } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';

@Injectable()
export class StudentService {
  constructor(@Inject('STUDENT_CLIENT') private studentClient: ClientKafkaProxy){}

  async onModuleInit(){
    this.studentClient.subscribeToResponseOf('student.createProfile');
    await this.studentClient.connect();
  }

  async createStudentProfile(createStudentProfileDto: CreateStudentProfileDto){
    return this.studentClient.send('student.createProfile', createStudentProfileDto);
  }
}
