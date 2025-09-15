import { Controller, Get, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStudentProfileDto } from '../../libs/dtos/create-student-profile.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';

@Controller()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @MessagePattern('student.createProfile')
  async createStudentProfile(@Payload() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto)
  }
  
}
