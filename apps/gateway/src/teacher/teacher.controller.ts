import { Body, Controller, Post, UseGuards, Get, Put, Delete, Param, Query } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from 'apps/libs/dtos/update-teacher-profile.dto';
import { QueryTeachersDto } from 'apps/libs/dtos/query-teachers.dto';
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

@ApiTags('Teachers')
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @ApiOperation({
    summary: 'Create teacher profile',
    description: 'Create a new teacher profile with all required information including subjects and classes they can teach. Only accessible by admins. This will also trigger the creation of authentication credentials for the teacher.'
  })
  @ApiBody({ 
    type: CreateTeacherProfileDto,
    description: 'Teacher profile information including personal details, contact information, and teaching capabilities'
  })
  @ApiCreatedResponse({
    description: 'Teacher profile created successfully. Authentication credentials will be sent to the provided email.',
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
    description: 'Admin role required - only admins can create teacher profiles',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('create-profile')
  async createTeacherProfile(@Body() data: CreateTeacherProfileDto) {
    return this.teacherService.createTeacherProfile(data);
  }

  @ApiOperation({
    summary: 'Get all teachers with pagination and filtering',
    description: 'Retrieve a paginated list of teachers with optional search, filtering by subject/class, and sorting. Accessible by admins.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for name, email, phone' })
  @ApiQuery({ name: 'subject', required: false, type: String, description: 'Filter by subject taught' })
  @ApiQuery({ name: 'class', required: false, type: String, description: 'Filter by class taught' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['fullName', 'email', 'phone', 'createdAt'], description: 'Field to sort by' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiOkResponse({
    description: 'Teachers retrieved successfully with pagination metadata'
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getAllTeachers(@Query() query: QueryTeachersDto) {
    return this.teacherService.getAllTeachers(query);
  }

  @ApiOperation({
    summary: 'Get teacher by ID',
    description: 'Retrieve detailed information about a specific teacher by their ID. Accessible by admins.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Teacher UUID' })
  @ApiOkResponse({
    description: 'Teacher details retrieved successfully'
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  async getTeacherById(@Param('id') id: string) {
    return this.teacherService.getTeacherById(id);
  }

  @ApiOperation({
    summary: 'Update teacher profile',
    description: 'Update an existing teacher\'s profile information. Only accessible by admins.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Teacher UUID' })
  @ApiBody({ type: UpdateTeacherProfileDto })
  @ApiOkResponse({
    description: 'Teacher profile updated successfully'
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async updateTeacher(
    @Param('id') id: string,
    @Body() updateTeacherProfileDto: UpdateTeacherProfileDto
  ) {
    return this.teacherService.updateTeacher(id, updateTeacherProfileDto);
  }

  @ApiOperation({
    summary: 'Delete teacher',
    description: 'Permanently delete a teacher profile and associated authentication credentials. Only accessible by admins.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Teacher UUID' })
  @ApiOkResponse({
    description: 'Teacher deleted successfully'
  })
  @ApiNotFoundResponse({
    description: 'Teacher not found',
    type: ErrorResponseDto
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteTeacher(@Param('id') id: string) {
    return this.teacherService.deleteTeacher(id);
  }

  @ApiOperation({
    summary: 'Get teacher statistics',
    description: 'Retrieve aggregated statistics about teachers including total count and breakdowns by subject, class, and gender.'
  })
  @ApiOkResponse({
    description: 'Teacher statistics retrieved successfully'
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('stats/overview')
  async getTeacherStats() {
    return this.teacherService.getTeacherStats();
  }
}
