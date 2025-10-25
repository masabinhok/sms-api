import { Controller } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateActivityDto } from 'apps/libs/dtos/create-activity.dto';
import { QueryActivityDto } from 'apps/libs/dtos/query-activity.dto';

@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @EventPattern('activity.log')
  async handleActivityLog(@Payload() payload: CreateActivityDto) {
    return this.activityService.createActivity(payload);
  }

  @MessagePattern('activity.getAll')
  async getAllActivities(@Payload() payload: QueryActivityDto) {
    return this.activityService.getAllActivities(payload);
  }

  @MessagePattern('activity.getById')
  async getActivityById(@Payload() payload: { id: string }) {
    return this.activityService.getActivityById(payload.id);
  }

  @MessagePattern('activity.getStats')
  async getActivityStats() {
    return this.activityService.getActivityStats();
  }
}
