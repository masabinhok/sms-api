import { Controller, Get } from '@nestjs/common';
import { TeacherService } from './teacher.service';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  getHello(): string {
    return this.teacherService.getHello();
  }
}
