import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { CreateClassDto } from 'apps/libs/dtos/create-class.dto';
import { UpdateClassDto } from 'apps/libs/dtos/update-class.dto';
import { CreateSubjectDto } from 'apps/libs/dtos/create-subject.dto';
import { UpdateSubjectDto } from 'apps/libs/dtos/update-subject.dto';
import { AssignSubjectsToClassDto } from 'apps/libs/dtos/assign-subjects-to-class.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class AcademicsService {

  constructor(
    private prisma: PrismaService
  ) {}

  // ==================== SCHOOL OPERATIONS ====================

  async getSchool(){
    const school = await this.prisma.school.findFirst();
    if (!school) {
      return {
        message: 'No school found. Please run the seed script first.',
        school: null
      };
    }
    return {
      message: 'School retrieved successfully',
      school
    };
  }

  async updateSchool(updateSchoolDto: UpdateSchoolDto){
    const school = await this.prisma.school.update({
      where: {
        id: updateSchoolDto.id,
      },
      data: updateSchoolDto,
    })
    return {
      message: 'School updated successfully',
      school
    }
  }

  // ==================== CLASS OPERATIONS ====================

  async createClass(createClassDto: CreateClassDto) {
    // Generate slug from name
    const slug = createClassDto.name.toLowerCase().replace(/\s+/g, '-');

    // Check if class with same grade, section, and academic year already exists
    const existing = await this.prisma.class.findFirst({
      where: {
        grade: createClassDto.grade,
        section: createClassDto.section || null,
        academicYear: createClassDto.academicYear,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Class with grade ${createClassDto.grade}, section ${createClassDto.section || 'none'}, and academic year ${createClassDto.academicYear} already exists`
      );
    }

    const newClass = await this.prisma.class.create({
      data: {
        ...createClassDto,
        slug,
      },
    });

    return {
      message: 'Class created successfully',
      class: newClass,
    };
  }

  async getAllClasses(academicYear?: string, isActive?: boolean) {
    const where: any = {};
    if (academicYear) where.academicYear = academicYear;
    if (isActive !== undefined) where.isActive = isActive;

    const classes = await this.prisma.class.findMany({
      where,
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' },
      ],
    });

    return {
      message: 'Classes retrieved successfully',
      classes,
      total: classes.length,
    };
  }

  async getClassById(id: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return {
      message: 'Class retrieved successfully',
      class: classData,
    };
  }

  async updateClass(updateClassDto: UpdateClassDto) {
    const { id, ...updateData } = updateClassDto;

    // Check if class exists
    const existing = await this.prisma.class.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // If name is being updated, regenerate slug
    if (updateData.name) {
      updateData['slug'] = updateData.name.toLowerCase().replace(/\s+/g, '-');
    }

    const updated = await this.prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return {
      message: 'Class updated successfully',
      class: updated,
    };
  }

  async deleteClass(id: string) {
    const existing = await this.prisma.class.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    await this.prisma.class.delete({ where: { id } });

    return {
      message: 'Class deleted successfully',
    };
  }

  // ==================== SUBJECT OPERATIONS ====================

  async createSubject(createSubjectDto: CreateSubjectDto) {
    // Generate slug from name
    const slug = createSubjectDto.name.toLowerCase().replace(/\s+/g, '-');

    // Check if subject with same code already exists
    const existing = await this.prisma.subject.findUnique({
      where: { code: createSubjectDto.code },
    });

    if (existing) {
      throw new ConflictException(`Subject with code ${createSubjectDto.code} already exists`);
    }

    const subject = await this.prisma.subject.create({
      data: {
        ...createSubjectDto,
        slug,
      },
    });

    return {
      message: 'Subject created successfully',
      subject,
    };
  }

  async getAllSubjects(category?: string, isActive?: boolean) {
    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    const subjects = await this.prisma.subject.findMany({
      where,
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      message: 'Subjects retrieved successfully',
      subjects,
      total: subjects.length,
    };
  }

  async getSubjectById(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return {
      message: 'Subject retrieved successfully',
      subject,
    };
  }

  async updateSubject(updateSubjectDto: UpdateSubjectDto) {
    const { id, ...updateData } = updateSubjectDto;

    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // If name is being updated, regenerate slug
    if (updateData.name) {
      updateData['slug'] = updateData.name.toLowerCase().replace(/\s+/g, '-');
    }

    // If code is being updated, check for conflicts
    if (updateData.code && updateData.code !== existing.code) {
      const codeExists = await this.prisma.subject.findUnique({
        where: { code: updateData.code },
      });
      if (codeExists) {
        throw new ConflictException(`Subject with code ${updateData.code} already exists`);
      }
    }

    const updated = await this.prisma.subject.update({
      where: { id },
      data: updateData,
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
    });

    return {
      message: 'Subject updated successfully',
      subject: updated,
    };
  }

  async deleteSubject(id: string) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.prisma.subject.delete({ where: { id } });

    return {
      message: 'Subject deleted successfully',
    };
  }

  // ==================== CLASS-SUBJECT ASSIGNMENT ====================

  async assignSubjectsToClass(assignDto: AssignSubjectsToClassDto) {
    const { classId, subjects } = assignDto;

    // Verify class exists
    const classExists = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!classExists) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Verify all subjects exist
    const subjectIds = subjects.map(s => s.subjectId);
    const existingSubjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
    });

    if (existingSubjects.length !== subjectIds.length) {
      throw new BadRequestException('One or more subjects not found');
    }

    // Check for already assigned subjects
    const existingAssignments = await this.prisma.classSubject.findMany({
      where: {
        classId,
        subjectId: { in: subjectIds },
      },
    });

    if (existingAssignments.length > 0) {
      const alreadyAssigned = existingAssignments.map(a => {
        const subject = existingSubjects.find(s => s.id === a.subjectId);
        return subject?.name || a.subjectId;
      });
      throw new ConflictException(
        `The following subjects are already assigned to this class: ${alreadyAssigned.join(', ')}`
      );
    }

    // Create new assignments
    const assignments = await Promise.all(
      subjects.map(sub =>
        this.prisma.classSubject.create({
          data: {
            classId,
            subjectId: sub.subjectId,
            isCompulsory: sub.isCompulsory ?? true,
            weeklyPeriods: sub.weeklyPeriods ?? 5,
          },
          include: {
            subject: true,
          },
        })
      )
    );

    return {
      message: `Successfully assigned ${assignments.length} subject(s) to class`,
      assignments,
      total: assignments.length,
    };
  }

  async getClassSubjects(classId: string) {
    const classExists = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!classExists) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    const subjects = await this.prisma.classSubject.findMany({
      where: { classId },
      include: {
        subject: true,
      },
      orderBy: {
        subject: {
          name: 'asc',
        },
      },
    });

    return subjects;
  }

  async removeSubjectFromClass(classId: string, subjectId: string) {
    // Verify class exists
    const classExists = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!classExists) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // Verify subject exists
    const subjectExists = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subjectExists) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    // Find the assignment
    const assignment = await this.prisma.classSubject.findFirst({
      where: {
        classId,
        subjectId,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Subject ${subjectExists.name} is not assigned to this class`
      );
    }

    // Delete the assignment
    await this.prisma.classSubject.delete({
      where: {
        id: assignment.id,
      },
    });

    return {
      message: `Successfully removed ${subjectExists.name} from class`,
      removedSubject: subjectExists.name,
    };
  }
}
