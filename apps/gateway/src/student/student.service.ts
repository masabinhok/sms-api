import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from 'apps/libs/dtos/update-student-profile.dto';
import { QueryStudentsDto } from 'apps/libs/dtos/query-students.dto';

@Injectable()
export class StudentService implements OnModuleInit {
  private isClientReady = false;
  
  constructor(@Inject('STUDENT_CLIENT') private studentClient: ClientKafkaProxy){}

  async onModuleInit(){
    try {
      this.studentClient.subscribeToResponseOf('student.createProfile');
      this.studentClient.subscribeToResponseOf('student.getAll');
      this.studentClient.subscribeToResponseOf('student.getById');
      this.studentClient.subscribeToResponseOf('student.update');
      this.studentClient.subscribeToResponseOf('student.delete');
      this.studentClient.subscribeToResponseOf('student.getStats');
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

  async getAllStudents(query: QueryStudentsDto) {
    return this.studentClient.send('student.getAll', query);
  }

  async getStudentById(id: string) {
    return this.studentClient.send('student.getById', id);
  }

  async updateStudent(id: string, updateStudentProfileDto: UpdateStudentProfileDto) {
    return this.studentClient.send('student.update', { id, updateStudentProfileDto });
  }

  async deleteStudent(id: string) {
    return this.studentClient.send('student.delete', id);
  }

  async getStudentStats() {
    return this.studentClient.send('student.getStats', {});
  }
}
