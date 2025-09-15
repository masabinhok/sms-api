import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HandleStudentCreatedDto } from 'apps/libs/shared/dtos/handle-student-created.dto';
import { HandleTeacherCreatedDto } from 'apps/libs/shared/dtos/handle-teacher-created.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService
  ) {}

  @EventPattern('student.created')
  async handleStudentCreated(@Payload() payload: HandleStudentCreatedDto ){
    return this.authService.handleStudentCreated(payload);
  }

  @EventPattern('teacher.created')
  async handleTeacherCreated(@Payload() payload: HandleTeacherCreatedDto ){
    return this.authService.handleTeacherCreated(payload);
  }

}
