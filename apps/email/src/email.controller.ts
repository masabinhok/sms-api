import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventPattern } from '@nestjs/microservices';
import { handleSendCredentialsDto } from 'apps/libs/shared/dtos/handle-send-credentials.dto';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('send.credentials')
  async handleSendCredentials(data: handleSendCredentialsDto){
    return this.emailService.handleSendCredentials(data);
  }
  
}
