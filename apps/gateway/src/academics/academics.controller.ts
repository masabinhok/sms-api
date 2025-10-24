import { Body, Controller, Get, Post, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { CreateClassDto } from 'apps/libs/dtos/create-class.dto';
import { UpdateClassDto } from 'apps/libs/dtos/update-class.dto';
import { CreateSubjectDto } from 'apps/libs/dtos/create-subject.dto';
import { UpdateSubjectDto } from 'apps/libs/dtos/update-subject.dto';
import { AssignSubjectsToClassDto } from 'apps/libs/dtos/assign-subjects-to-class.dto';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { AuthGuard } from 'apps/libs/guards/auth.guard';

@Controller('academics')
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  // ==================== SCHOOL ENDPOINTS ====================

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

  // ==================== CLASS ENDPOINTS ====================

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/classes')
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.academicsService.createClass(createClassDto);
  }

  // Public endpoint - for fetching classes when creating student/teacher profiles
  @Get('/classes')
  async getAllClasses(
    @Query('academicYear') academicYear?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.academicsService.getAllClasses(academicYear, isActiveBoolean);
  }

  @Get('/classes/:id')
  async getClassById(@Param('id') id: string) {
    return this.academicsService.getClassById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('/classes/:id')
  async updateClass(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.academicsService.updateClass({ ...updateClassDto, id });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('/classes/:id')
  async deleteClass(@Param('id') id: string) {
    return this.academicsService.deleteClass(id);
  }

  // ==================== SUBJECT ENDPOINTS ====================

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/subjects')
  async createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    return this.academicsService.createSubject(createSubjectDto);
  }

  // Public endpoint - for fetching subjects when creating student/teacher profiles
  @Get('/subjects')
  async getAllSubjects(
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.academicsService.getAllSubjects(category, isActiveBoolean);
  }

  @Get('/subjects/:id')
  async getSubjectById(@Param('id') id: string) {
    return this.academicsService.getSubjectById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('/subjects/:id')
  async updateSubject(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.academicsService.updateSubject({ ...updateSubjectDto, id });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('/subjects/:id')
  async deleteSubject(@Param('id') id: string) {
    return this.academicsService.deleteSubject(id);
  }

  // ==================== CLASS-SUBJECT ASSIGNMENT ENDPOINTS ====================

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/classes/:classId/subjects')
  async assignSubjectsToClass(
    @Param('classId') classId: string,
    @Body() assignDto: Omit<AssignSubjectsToClassDto, 'classId'>
  ) {
    return this.academicsService.assignSubjectsToClass({ 
      classId, 
      subjects: assignDto.subjects 
    });
  }

  @Get('/classes/:classId/subjects')
  async getClassSubjects(@Param('classId') classId: string) {
    return this.academicsService.getClassSubjects(classId);
  }
}
