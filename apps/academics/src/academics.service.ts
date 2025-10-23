import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateSchoolDto } from 'apps/libs/dtos/create-school.dto';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class AcademicsService {

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private prisma: PrismaService
  ) {}

  async createSchool(createSchoolDto: CreateSchoolDto){
    console.log('Check')
    const school = await this.prisma.school.create({
      data: createSchoolDto,
    });
    console.log('Check2')

    this.authClient.emit('school.created', {
      schoolId: school.id,
      name: school.name,
    })

    return {
      message: 'School created successfully',
      school
    }
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
}
