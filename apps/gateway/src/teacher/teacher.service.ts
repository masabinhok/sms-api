import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafkaProxy,  } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from 'apps/libs/dtos/update-teacher-profile.dto';
import { QueryTeachersDto } from 'apps/libs/dtos/query-teachers.dto';

@Injectable()
export class TeacherService implements OnModuleInit {
  private isClientReady = false;
  
  constructor(@Inject('TEACHER_CLIENT') private teacherClient: ClientKafkaProxy){}

  async onModuleInit(){
    try {
      this.teacherClient.subscribeToResponseOf('teacher.createProfile');
      this.teacherClient.subscribeToResponseOf('teacher.getAll');
      this.teacherClient.subscribeToResponseOf('teacher.getById');
      this.teacherClient.subscribeToResponseOf('teacher.update');
      this.teacherClient.subscribeToResponseOf('teacher.delete');
      this.teacherClient.subscribeToResponseOf('teacher.getStats');
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

  async getAllTeachers(query: QueryTeachersDto) {
    return this.teacherClient.send('teacher.getAll', query);
  }

  async getTeacherById(id: string) {
    return this.teacherClient.send('teacher.getById', id);
  }

  async updateTeacher(id: string, updateTeacherProfileDto: UpdateTeacherProfileDto) {
    return this.teacherClient.send('teacher.update', { id, updateTeacherProfileDto });
  }

  async deleteTeacher(id: string) {
    return this.teacherClient.send('teacher.delete', id);
  }

  async getTeacherStats() {
    return this.teacherClient.send('teacher.getStats', {});
  }
}
