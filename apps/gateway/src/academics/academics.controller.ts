import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { AuthGuard } from 'apps/libs/guards/auth.guard';

@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  // Public endpoint - no authentication required
  @Get('/school')
  async getSchool(){
    return this.academicsService.getSchool();
  }

  // Protected endpoint - only admins can update
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('/update-school')
  async updateSchool(@Body() updateSchoolDto: UpdateSchoolDto){
    return this.academicsService.updateSchool(updateSchoolDto);
  }

}
