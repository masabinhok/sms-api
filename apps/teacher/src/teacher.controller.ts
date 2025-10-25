import { Controller } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from 'apps/libs/dtos/update-teacher-profile.dto';
import { QueryTeachersDto } from 'apps/libs/dtos/query-teachers.dto';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @MessagePattern('teacher.createProfile')
  async createTeacherProfile(@Payload() data: CreateTeacherProfileDto){
    return this.teacherService.createTeacherProfile(data)
  }

  @MessagePattern('teacher.getAll')
  async getAllTeachers(@Payload() query: QueryTeachersDto) {
    return this.teacherService.getAllTeachers(query);
  }

  @MessagePattern('teacher.getById')
  async getTeacherById(@Payload() id: string) {
    return this.teacherService.getTeacherById(id);
  }

  @MessagePattern('teacher.update')
  async updateTeacher(@Payload() data: { id: string; updateTeacherProfileDto: UpdateTeacherProfileDto; userId: string; userRole: string }) {
    return this.teacherService.updateTeacher(data.id, data.updateTeacherProfileDto, data.userId, data.userRole);
  }

  @MessagePattern('teacher.delete')
  async deleteTeacher(@Payload() data: { id: string; userId: string; userRole: string }) {
    return this.teacherService.deleteTeacher(data.id, data.userId, data.userRole);
  }

  @MessagePattern('teacher.getStats')
  async getTeacherStats() {
    return this.teacherService.getTeacherStats();
  }
}
