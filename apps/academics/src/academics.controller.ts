import { Controller, Get } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';

@Controller()
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @MessagePattern('school.update')
  async updateSchool(@Payload() updateSchoolDto: UpdateSchoolDto){
    return this.academicsService.updateSchool(updateSchoolDto);
  }
}
