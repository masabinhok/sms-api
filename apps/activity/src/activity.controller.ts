import { Controller, Get } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  getHello(): string {
    return this.activityService.getHello();
  }
}
