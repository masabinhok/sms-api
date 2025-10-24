import { Injectable } from '@nestjs/common';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { PrismaService } from './prisma.service';

@Injectable()
export class AcademicsService {

  constructor(
    private prisma: PrismaService
  ) {}

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
