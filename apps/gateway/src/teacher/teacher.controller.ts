import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { AuthGuard } from 'apps/libs/guards/auth.guard';


@UseGuards(AuthGuard)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}


  @Post('create-profile')
  async createTeacherProfile(@Body() data: CreateTeacherProfileDto) {
    return this.teacherService.createTeacherProfile(data);
  }
}
