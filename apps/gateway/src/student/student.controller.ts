import { Body, Controller, Post } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentProfileDto } from 'apps/libs/shared/dtos/create-student-profile.dto';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService){}

  @Post('/createProfile')
  async createStudentProfile(@Body() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto);
  }
}
