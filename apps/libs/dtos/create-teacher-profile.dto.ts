import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsArray, 
  IsEnum, 
  IsOptional, 
  IsIn, 
  Length, 
  Matches,
  IsDateString,
  IsISO8601
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { normalizeISODate } from '../utils/utils';

export enum Subject {
  MATH = 'MATH',
  SCIENCE = 'SCIENCE',
  ENGLISH = 'ENGLISH',
  COMPUTER_SCIENCE = 'COMPUTER_SCIENCE',
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  MUSIC = 'MUSIC',
  DANCE = 'DANCE',
  ART = 'ART',
  SOCIAL_STUDIES = 'SOCIAL_STUDIES',
}

export enum Class {
  NURSERY = 'NURSERY',
  LKG = 'LKG',
  UKG = 'UKG',
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  FOURTH = 'FOURTH',
  FIFTH = 'FIFTH',
  SIXTH = 'SIXTH',
  SEVENTH = 'SEVENTH',
  EIGHTH = 'EIGHTH',
  NINTH = 'NINTH',
  TENTH = 'TENTH',
  ELEVENTH = 'ELEVENTH',
  TWELFTH = 'TWELFTH',
}

export class CreateTeacherProfileDto {
  @ApiProperty({
    description: 'Full name of the teacher',
    example: 'Dr. Sarah Johnson',
    minLength: 2,
    maxLength: 100,
    type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({
    description: 'Email address of the teacher',
    example: 'sarah.johnson@school.com',
    type: String,
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({
    description: 'Gender of the teacher',
    enum: ['Male', 'Female', 'Other'],
    example: 'Female'
  })
  @IsString()
  @IsNotEmpty({ message: 'Gender is required' })
  @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
  gender: string;

  @ApiProperty({
    description: 'Phone number of the teacher (10-15 digits)',
    example: '9876543210',
    pattern: '^[0-9]{10,15}$',
    type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9]{10,15}$/, { message: 'Phone number must be a valid number (10-15 digits)' })
  phone: string;

  @ApiProperty({
    description: 'Home address of the teacher',
    example: '456 Oak Avenue, City, State, ZIP',
    minLength: 5,
    maxLength: 200,
    type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @ApiProperty({
    description: 'Date of birth in ISO-8601 format',
    example: '1985-03-20T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsISO8601({ strict: true }, { message: 'Date of birth must be a valid ISO-8601 DateTime format (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)' })
  @Transform(({ value }) => {
    return normalizeISODate(value);
  })
  dob: string;

  @ApiPropertyOptional({
    description: 'Subjects that the teacher can teach',
    enum: Subject,
    isArray: true,
    example: [Subject.MATH, Subject.PHYSICS],
    enumName: 'Subject'
  })
  @IsArray({ message: 'Subjects must be an array' })
  @IsEnum(Subject, { each: true, message: 'Each subject must be a valid subject' })
  @IsOptional()
  subjects?: Subject[];

  @ApiPropertyOptional({
    description: 'Classes that the teacher can teach',
    enum: Class,
    isArray: true,
    example: [Class.NINTH, Class.TENTH],
    enumName: 'Class'
  })
  @IsArray({ message: 'Classes must be an array' })
  @IsEnum(Class, { each: true, message: 'Each class must be a valid class' })
  @IsOptional()
  classes?: Class[];
}