import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventPattern } from '@nestjs/microservices';
import { handleSendCredentialsDto } from 'apps/libs/dtos/handle-send-credentials.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user.created')
  async handleSendCredentials(data: handleSendCredentialsDto){
    return this.emailService.handleSendCredentials(data);
  }

  @EventPattern('tempPass.created')
  async handleForgotPassword(data: { email: string; tempPassword: string }){
    return this.emailService.handleForgotPassword(data);
  }
  
}
