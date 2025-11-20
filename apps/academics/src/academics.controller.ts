import { Controller, Get } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { CreateClassDto } from 'apps/libs/dtos/create-class.dto';
import { UpdateClassDto } from 'apps/libs/dtos/update-class.dto';
import { CreateSubjectDto } from 'apps/libs/dtos/create-subject.dto';
import { UpdateSubjectDto } from 'apps/libs/dtos/update-subject.dto';
import { AssignSubjectsToClassDto } from 'apps/libs/dtos/assign-subjects-to-class.dto';

@Controller()
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('health')
  health() {
    return { 
      status: 'ok', 
      service: 'academics',
      timestamp: new Date().toISOString() 
    };
  }

  // ==================== SCHOOL PATTERNS ====================

  @MessagePattern('school.get')
  async getSchool(){
    return this.academicsService.getSchool();
  }

  @MessagePattern('school.update')
  async updateSchool(@Payload() updateSchoolDto: UpdateSchoolDto){
    return this.academicsService.updateSchool(updateSchoolDto);
  }

  // ==================== CLASS PATTERNS ====================

  @MessagePattern('class.create')
  async createClass(@Payload() createClassDto: CreateClassDto) {
    return this.academicsService.createClass(createClassDto);
  }

  @MessagePattern('class.getAll')
  async getAllClasses(@Payload() payload: { academicYear?: string; isActive?: boolean }) {
    return this.academicsService.getAllClasses(payload.academicYear, payload.isActive);
  }

  @MessagePattern('class.getById')
  async getClassById(@Payload() payload: { id: string }) {
    return this.academicsService.getClassById(payload.id);
  }

  @MessagePattern('class.update')
  async updateClass(@Payload() updateClassDto: UpdateClassDto) {
    return this.academicsService.updateClass(updateClassDto);
  }

  @MessagePattern('class.delete')
  async deleteClass(@Payload() payload: { id: string }) {
    return this.academicsService.deleteClass(payload.id);
  }

  // ==================== SUBJECT PATTERNS ====================

  @MessagePattern('subject.create')
  async createSubject(@Payload() createSubjectDto: CreateSubjectDto) {
    return this.academicsService.createSubject(createSubjectDto);
  }

  @MessagePattern('subject.getAll')
  async getAllSubjects(@Payload() payload: { category?: string; isActive?: boolean }) {
    return this.academicsService.getAllSubjects(payload.category, payload.isActive);
  }

  @MessagePattern('subject.getById')
  async getSubjectById(@Payload() payload: { id: string }) {
    return this.academicsService.getSubjectById(payload.id);
  }

  @MessagePattern('subject.update')
  async updateSubject(@Payload() updateSubjectDto: UpdateSubjectDto) {
    return this.academicsService.updateSubject(updateSubjectDto);
  }

  @MessagePattern('subject.delete')
  async deleteSubject(@Payload() payload: { id: string }) {
    return this.academicsService.deleteSubject(payload.id);
  }

  // ==================== CLASS-SUBJECT ASSIGNMENT PATTERNS ====================

  @MessagePattern('class.assignSubjects')
  async assignSubjectsToClass(@Payload() assignDto: AssignSubjectsToClassDto) {
    return this.academicsService.assignSubjectsToClass(assignDto);
  }

  @MessagePattern('class.getSubjects')
  async getClassSubjects(@Payload() payload: { classId: string }) {
    return this.academicsService.getClassSubjects(payload.classId);
  }

  @MessagePattern('class.removeSubject')
  async removeSubjectFromClass(@Payload() payload: { classId: string; subjectId: string }) {
    return this.academicsService.removeSubjectFromClass(payload.classId, payload.subjectId);
  }
}
