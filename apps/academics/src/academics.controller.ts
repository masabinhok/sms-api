import { Controller, Get } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSchoolDto } from 'apps/libs/dtos/create-school.dto';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';

@Controller()
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @MessagePattern('school.create')
  async createSchool(@Payload() payload: {
    createSchoolDto: CreateSchoolDto;
    userId: string;
  }){
    console.log('Check')
    return this.academicsService.createSchool(payload.createSchoolDto, payload.userId);
  }

  @MessagePattern('school.update')
  async updateSchool(@Payload() updateSchoolDto: UpdateSchoolDto){
    return this.academicsService.updateSchool(updateSchoolDto);
  }
}
