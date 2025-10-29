import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { HandleStudentCreatedDto } from 'apps/libs/dtos/handle-student-created.dto';
import { HandleTeacherCreatedDto } from 'apps/libs/dtos/handle-teacher-created.dto';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { PasswordChangeDto } from '../dtos/password-change.dto'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService
  ) {}


  @EventPattern('student.created')
  async handleStudentCreated(@Payload() payload: HandleStudentCreatedDto ){
    return this.authService.handleStudentCreated(payload);
  }

  @MessagePattern('user.forgot-password')
  async handleForgotPassword(@Payload() payload: { username: string }){
    return this.authService.handleForgotPassword(payload.username);
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
  async createAdminProfile(@Payload() payload: {name: string, email: string, actorUserId?: string, actorUsername?: string, actorRole?: string}){
      return this.authService.createAdminProfile(payload);
  }

  @MessagePattern('admin.list')
  async listAdmins(@Payload() payload: { page?: number; limit?: number; search?: string }){
    return this.authService.listAdmins(payload);
  }

  @MessagePattern('admin.get')
  async getAdmin(@Payload() payload: { id: string }){
    return this.authService.getAdmin(payload.id);
  }

  @MessagePattern('admin.update')
  async updateAdmin(@Payload() payload: { id: string; data: any; actorUserId?: string; actorUsername?: string; actorRole?: string }){
    return this.authService.updateAdmin(payload.id, payload.data, payload);
  }

  @MessagePattern('admin.delete')
  async deleteAdmin(@Payload() payload: { id: string; actorUserId?: string; actorUsername?: string; actorRole?: string }){
    return this.authService.deleteAdmin(payload.id, payload);
  }

  @MessagePattern('user.changePassword')
  async handlePasswordChange(@Payload() payload: PasswordChangeDto){
    return this.authService.handlePasswordChange(payload);
  }

  @MessagePattern('user.me')
  async handleGetMe(@Payload() payload: {userId: string}){
    return this.authService.handleGetMe(payload.userId)
  }


}
