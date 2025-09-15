import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @MessagePattern('teacher.createProfile')
  async createTeacherProfile(data: CreateTeacherProfileDto){
    return this.teacherService.createTeacherProfile(data)
  }
  
}
