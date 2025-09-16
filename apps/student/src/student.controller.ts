import { Controller } from '@nestjs/common';
import { StudentService } from './student.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStudentProfileDto } from '../../libs/dtos/create-student-profile.dto';

@Controller()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @MessagePattern('student.createProfile')
  async createStudentProfile(@Payload() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto)
  }
  
}
