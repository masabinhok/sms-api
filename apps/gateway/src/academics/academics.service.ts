import { Inject, Injectable } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { CreateClassDto } from 'apps/libs/dtos/create-class.dto';
import { UpdateClassDto } from 'apps/libs/dtos/update-class.dto';
import { CreateSubjectDto } from 'apps/libs/dtos/create-subject.dto';
import { UpdateSubjectDto } from 'apps/libs/dtos/update-subject.dto';
import { AssignSubjectsToClassDto } from 'apps/libs/dtos/assign-subjects-to-class.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AcademicsService {
    private isClientReady = false;

    constructor(@Inject('ACADEMICS_CLIENT') private academicsClient: ClientKafkaProxy) {}

    async onModuleInit(){
        try {
            // School patterns
            this.academicsClient.subscribeToResponseOf('school.get');
            this.academicsClient.subscribeToResponseOf('school.update');
            
            // Class patterns
            this.academicsClient.subscribeToResponseOf('class.create');
            this.academicsClient.subscribeToResponseOf('class.getAll');
            this.academicsClient.subscribeToResponseOf('class.getById');
            this.academicsClient.subscribeToResponseOf('class.update');
            this.academicsClient.subscribeToResponseOf('class.delete');
            
            // Subject patterns
            this.academicsClient.subscribeToResponseOf('subject.create');
            this.academicsClient.subscribeToResponseOf('subject.getAll');
            this.academicsClient.subscribeToResponseOf('subject.getById');
            this.academicsClient.subscribeToResponseOf('subject.update');
            this.academicsClient.subscribeToResponseOf('subject.delete');
            
            // Class-Subject assignment patterns
            this.academicsClient.subscribeToResponseOf('class.assignSubjects');
            this.academicsClient.subscribeToResponseOf('class.getSubjects');
            this.academicsClient.subscribeToResponseOf('class.removeSubject');
            
            await this.academicsClient.connect();

            await new Promise(resolve => setTimeout(resolve, 1000))
            this.isClientReady = true;
            console.log('Academics service client is ready');
        } catch (error) {
            console.error('Error initializing Academics service client', error);
        }
    }

    // ==================== SCHOOL METHODS ====================

    async getSchool(){
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('school.get', {}));
    }

    async updateSchool(updateSchoolDto: UpdateSchoolDto){
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('school.update', updateSchoolDto));
    }

    // ==================== CLASS METHODS ====================

    async createClass(createClassDto: CreateClassDto) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.create', createClassDto));
    }

    async getAllClasses(academicYear?: string, isActive?: boolean) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.getAll', { academicYear, isActive }));
    }

    async getClassById(id: string) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.getById', { id }));
    }

    async updateClass(updateClassDto: UpdateClassDto) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.update', updateClassDto));
    }

    async deleteClass(id: string) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.delete', { id }));
    }

    // ==================== SUBJECT METHODS ====================

    async createSubject(createSubjectDto: CreateSubjectDto) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('subject.create', createSubjectDto));
    }

    async getAllSubjects(category?: string, isActive?: boolean) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('subject.getAll', { category, isActive }));
    }

    async getSubjectById(id: string) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('subject.getById', { id }));
    }

    async updateSubject(updateSubjectDto: UpdateSubjectDto) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('subject.update', updateSubjectDto));
    }

    async deleteSubject(id: string) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('subject.delete', { id }));
    }

    // ==================== CLASS-SUBJECT ASSIGNMENT METHODS ====================

    async assignSubjectsToClass(assignDto: AssignSubjectsToClassDto) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.assignSubjects', assignDto));
    }

    async getClassSubjects(classId: string) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.getSubjects', { classId }));
    }

    async removeSubjectFromClass(classId: string, subjectId: string) {
        if(!this.isClientReady){
            throw new Error('Academics service client not ready');
        }
        return firstValueFrom(this.academicsClient.send('class.removeSubject', { classId, subjectId }));
    }
}
