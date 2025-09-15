import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';
import { AuthGuard } from 'apps/libs/guards/auth.guard';


@UseGuards(AuthGuard)
@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService){}


  @Post('/create-profile')
  async createStudentProfile(@Body() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto);
  }
}
