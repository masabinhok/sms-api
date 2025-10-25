import { Controller } from '@nestjs/common';
import { StudentService } from './student.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStudentProfileDto } from '../../libs/dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../../libs/dtos/update-student-profile.dto';
import { QueryStudentsDto } from '../../libs/dtos/query-students.dto';

@Controller()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @MessagePattern('student.createProfile')
  async createStudentProfile(@Payload() createStudentProfileDto: CreateStudentProfileDto) {
    return this.studentService.createStudentProfile(createStudentProfileDto);
  }

  @MessagePattern('student.getAll')
  async getAllStudents(@Payload() query: QueryStudentsDto) {
    return this.studentService.getAllStudents(query);
  }

  @MessagePattern('student.getById')
  async getStudentById(@Payload() id: string) {
    return this.studentService.getStudentById(id);
  }

  @MessagePattern('student.update')
  async updateStudent(@Payload() data: { id: string; updateStudentProfileDto: UpdateStudentProfileDto; userId: string; userRole: string }) {
    return this.studentService.updateStudent(data.id, data.updateStudentProfileDto, data.userId, data.userRole);
  }

  @MessagePattern('student.delete')
  async deleteStudent(@Payload() data: { id: string; userId: string; userRole: string }) {
    return this.studentService.deleteStudent(data.id, data.userId, data.userRole);
  }

  @MessagePattern('student.getStats')
  async getStudentStats() {
    return this.studentService.getStudentStats();
  }
}
