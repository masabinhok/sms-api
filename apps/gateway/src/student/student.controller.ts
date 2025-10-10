import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { ApiResponseDto, ErrorResponseDto } from 'apps/libs/dtos/response.dto';

@ApiTags('Students')
@ApiCookieAuth('access_token')
@UseGuards(AuthGuard)
@Controller('student')
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
  @Post('/create-profile')
  async createStudentProfile(@Body() createStudentProfileDto: CreateStudentProfileDto){
    return this.studentService.createStudentProfile(createStudentProfileDto);
  }
}
