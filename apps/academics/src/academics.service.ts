import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AcademicsService {
  constructor(private prisma: PrismaService ) {}

  async getClasses(){
    const classes = await this.prisma.class.findMany();
    console.log(classes);
    return {
      message: 'Classes retrieved successfully',
      classes
    }
  }

  async getSubjects(){
    const subjects = await this.prisma.subject.findMany();
    return {
      message: 'Subjects retrieved successfully',
      subjects
    };
  }

  async addSubject(name: string, classId: number){
    const subject = await this.prisma.subject.create({
      data: {
        name,
        classId
      }
    })

    return {
      message: 'Subject added successfully',
      subject,
    }
  }

  async addClass(name: string, subjects?: { name: string }[]){
    const newClass = await this.prisma.class.create({
      data: {
        name,
        ...(subjects?.length ? {
          subjects: {
            create: subjects
          } 
        }: {})
      },
      include: {
        subjects: true
      }
    });
    return {
      message: 'Class added successfully',
      newClass
    }
  }

}
