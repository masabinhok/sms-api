import { Controller, Get } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { MessagePattern } from '@nestjs/microservices/decorators/message-pattern.decorator';

@Controller()
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  
  @MessagePattern('getClasses')
  async getClasses(){
    return this.academicsService.getClasses();
  }

  @MessagePattern('getSubjects')
  async getSubjects(){
    return this.academicsService.getSubjects();
  }

  @MessagePattern('addSubject')
  async addSubject(data: { name: string; classId: number }) {
    return this.academicsService.addSubject(data.name, data.classId);
  }

  @MessagePattern('addClass')
  async addClass(data: { name: string; subjects?: { name: string }[] }) {
    return this.academicsService.addClass(data.name, data.subjects);
  }

}
