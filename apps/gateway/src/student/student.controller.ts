import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';


@UseGuards(AuthGuard)
@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService){}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('/create-profile')
  async createStudentProfile(@Body() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto);
  }
}
