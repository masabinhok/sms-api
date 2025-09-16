import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { HandleStudentCreatedDto } from 'apps/libs/dtos/handle-student-created.dto';
import { HandleTeacherCreatedDto } from 'apps/libs/dtos/handle-teacher-created.dto';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';

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

  @MessagePattern('user.login')
  async handleUserLogin(@Payload() payload: LoginDto){
    return this.authService.handleUserLogin(payload);
  }
  
  @MessagePattern('user.logout')
  async handleUserLogout(@Payload() payload: {userId: string}){
    return this.authService.handleUserLogout(payload.userId);
  }

  @MessagePattern('user.refresh')
  async handleUserRefresh(@Payload() payload: {userId: string, token: string}){
    return this.authService.handleUserRefresh(payload.userId, payload.token);
  }

  @MessagePattern('admin.createProfile')
  async createAdminProfile(@Payload() payload: {name: string, email: string}){
      return this.authService.createAdminProfile(payload);
  }


}
