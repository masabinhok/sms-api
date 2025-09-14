import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateStudentProfileDto } from 'apps/libs/shared/dtos/create-student-profile.dto';

@Injectable()
export class StudentService {
  constructor(@Inject('STUDENT_CLIENT') private studentClient: ClientProxy){}

  async createStudentProfile(createStudentProfileDto: CreateStudentProfileDto){
    return this.studentClient.send('student.createProfile', createStudentProfileDto);
  }
}
