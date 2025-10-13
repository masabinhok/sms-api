import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentProfileDto } from './create-student-profile.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStudentProfileDto extends PartialType(CreateStudentProfileDto) {
  @ApiPropertyOptional({
    description: 'ID of the student to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @IsOptional()
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  id?: string;
}
