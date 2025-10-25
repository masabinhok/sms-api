import { 
  IsOptional, 
  IsString, 
  IsEmail, 
  IsArray, 
  IsIn, 
  Length, 
  Matches,
  IsISO8601,
  IsUUID
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { normalizeISODate } from '../utils/utils';

export class UpdateTeacherProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the teacher',
    example: 'Dr. Sarah Johnson',
    minLength: 2,
    maxLength: 100,
    type: String
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Email address of the teacher',
    example: 'sarah.johnson@school.com',
    type: String,
    format: 'email'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Gender of the teacher',
    enum: ['Male', 'Female', 'Other'],
    example: 'Female'
  })
  @IsOptional()
  @IsString()
  @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
  gender?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the teacher (10-15 digits)',
    example: '9876543210',
    pattern: '^[0-9]{10,15}$',
    type: String
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, { message: 'Phone number must be a valid number (10-15 digits)' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Home address of the teacher',
    example: '456 Oak Avenue, City, State, ZIP',
    minLength: 5,
    maxLength: 200,
    type: String
  })
  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({
    description: 'Date of birth in ISO-8601 format',
    example: '1985-03-20T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Date of birth must be a valid ISO-8601 DateTime format (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)' })
  @Transform(({ value }) => {
    return value ? normalizeISODate(value) : value;
  })
  dob?: string;

  @ApiPropertyOptional({
    description: 'Array of subject IDs that the teacher can teach',
    isArray: true,
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Subject IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each subject ID must be a valid UUID' })
  subjectIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of class IDs that the teacher can teach',
    isArray: true,
    example: ['323e4567-e89b-12d3-a456-426614174002', '423e4567-e89b-12d3-a456-426614174003'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Class IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each class ID must be a valid UUID' })
  classIds?: string[];
}
