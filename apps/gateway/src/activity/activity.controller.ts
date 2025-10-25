import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { QueryActivityDto } from 'apps/libs/dtos/query-activity.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Activity Logs')
@Controller('activity')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({
    summary: 'Get all activity logs',
    description: 'Retrieve paginated activity logs with optional filtering. Only accessible by admins.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'userRole', required: false, enum: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] })
  @ApiQuery({ name: 'action', required: false, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'VIEW', 'EXPORT'] })
  @ApiQuery({ name: 'entityType', required: false, enum: ['USER', 'STUDENT', 'TEACHER', 'ADMIN', 'CLASS', 'SUBJECT', 'ASSIGNMENT', 'GRADE', 'ATTENDANCE', 'SCHOOL_SETTINGS'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
  })
  @Roles('ADMIN', 'SUPERADMIN')
  @Get()
  async getAllActivities(@Query() query: QueryActivityDto) {
    return this.activityService.getAllActivities(query);
  }

  @ApiOperation({
    summary: 'Get activity log by ID',
    description: 'Retrieve a specific activity log by its ID. Only accessible by admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity log retrieved successfully',
  })
  @Roles('ADMIN', 'SUPERADMIN')
  @Get('/stats')
  async getActivityStats() {
    return this.activityService.getActivityStats();
  }

  @ApiOperation({
    summary: 'Get activity statistics',
    description: 'Retrieve activity statistics including counts by action, entity type, and user role. Only accessible by admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity statistics retrieved successfully',
  })
  @Roles('ADMIN', 'SUPERADMIN')
  @Get(':id')
  async getActivityById(@Param('id') id: string) {
    return this.activityService.getActivityById(id);
  }
}
