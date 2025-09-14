import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HandleStudentCreatedDto } from 'apps/libs/shared/dtos/handle-student-created.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService
    
  ) {}

  @EventPattern('student.created')
  async handleStudentCreated(@Payload() payload: HandleStudentCreatedDto ){
    return this.authService.handleStudentCreated(payload);
  }

}
