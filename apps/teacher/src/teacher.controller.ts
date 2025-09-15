import { Controller, Get } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/shared/dtos/create-teacher-profile.dto';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @MessagePattern('teacher.createProfile')
  async createTeacherProfile(data: CreateTeacherProfileDto){
    return this.teacherService.createTeacherProfile(data)
  }
  
}
