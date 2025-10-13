import { Body, Controller, Post, UseGuards, Get, Put, Delete, Param, Query } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from 'apps/libs/dtos/update-student-profile.dto';
import { QueryStudentsDto } from 'apps/libs/dtos/query-students.dto';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { ApiResponseDto, ErrorResponseDto } from 'apps/libs/dtos/response.dto';

@ApiTags('Students')
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard)
@Controller('students')
export class StudentController {
  constructor(private studentService: StudentService){}

  @ApiOperation({
    summary: 'Create student profile',
    description: 'Create a new student profile with all required information. Only accessible by admins. This will also trigger the creation of authentication credentials for the student.'
  })
  @ApiBody({ 
    type: CreateStudentProfileDto,
    description: 'Student profile information including personal details, academic information, and guardian contact details'
  })
  @ApiCreatedResponse({
    description: 'Student profile created successfully. Authentication credentials will be sent to the provided email.',
    type: ApiResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Validation errors - invalid input data, duplicate email, or invalid date format',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required - valid access token needed',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({
    description: 'Admin role required - only admins can create student profiles',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  async createStudentProfile(@Body() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto);
  }

  @ApiOperation({
    summary: 'Get all students with pagination and filtering',
    description: 'Retrieve a paginated list of students with optional search, filtering by class/section, and sorting. Accessible by admins and teachers.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for name, email, roll number' })
  @ApiQuery({ name: 'className', required: false, type: String, description: 'Filter by class' })
  @ApiQuery({ name: 'section', required: false, type: String, description: 'Filter by section' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['fullName', 'email', 'class', 'section', 'rollNumber', 'createdAt'], description: 'Field to sort by' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiOkResponse({
    description: 'Students retrieved successfully with pagination metadata'
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get()
  async getAllStudents(@Query() query: QueryStudentsDto){
    return this.studentService.getAllStudents(query);
  }

  @ApiOperation({
    summary: 'Get student by ID',
    description: 'Retrieve detailed information about a specific student by their ID. Accessible by admins and teachers.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Student UUID' })
  @ApiOkResponse({
    description: 'Student details retrieved successfully'
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get(':id')
  async getStudentById(@Param('id') id: string){
    return this.studentService.getStudentById(id);
  }

  @ApiOperation({
    summary: 'Update student profile',
    description: 'Update an existing student\'s profile information. Only accessible by admins.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Student UUID' })
  @ApiBody({ type: UpdateStudentProfileDto })
  @ApiOkResponse({
    description: 'Student profile updated successfully'
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async updateStudent(
    @Param('id') id: string,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto
  ){
    return this.studentService.updateStudent(id, updateStudentProfileDto);
  }

  @ApiOperation({
    summary: 'Delete student',
    description: 'Permanently delete a student profile and associated authentication credentials. Only accessible by admins.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Student UUID' })
  @ApiOkResponse({
    description: 'Student deleted successfully'
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteStudent(@Param('id') id: string){
    return this.studentService.deleteStudent(id);
  }

  @ApiOperation({
    summary: 'Get student statistics',
    description: 'Retrieve aggregated statistics about students including total count and breakdowns by class, section, and gender.'
  })
  @ApiOkResponse({
    description: 'Student statistics retrieved successfully'
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Get('stats/overview')
  async getStudentStats(){
    return this.studentService.getStudentStats();
  }
}
