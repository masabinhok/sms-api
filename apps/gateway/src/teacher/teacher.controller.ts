import { Body, Controller, Post } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherProfileDto } from 'apps/libs/shared/dtos/create-teacher-profile.dto';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}


  @Post('create-profile')
  async createTeacherProfile(@Body() data: CreateTeacherProfileDto) {
    return this.teacherService.createTeacherProfile(data);
  }
}
