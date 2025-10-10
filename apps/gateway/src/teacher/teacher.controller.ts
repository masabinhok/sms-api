import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
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
}
