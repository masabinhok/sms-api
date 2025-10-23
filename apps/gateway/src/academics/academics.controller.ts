import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { CreateSchoolDto } from 'apps/libs/dtos/create-school.dto';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
@UseGuards(AuthGuard)
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Post('/create-school')
  async createSchool(@Body() createSchoolDto: CreateSchoolDto){
    console.log('check');
    return this.academicsService.createSchool(createSchoolDto);
  }


  @Patch('/update-school')
  async updateSchool(@Body() updateSchoolDto: UpdateSchoolDto){
    return this.academicsService.updateSchool(updateSchoolDto);
  }

}
