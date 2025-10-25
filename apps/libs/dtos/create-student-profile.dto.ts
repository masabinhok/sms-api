import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsIn, 
  Length, 
  Matches,
  IsISO8601,
  IsUUID,
  ValidateIf
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { normalizeISODate } from '../utils/utils';

export class CreateStudentProfileDto {
  @ApiProperty({
    description: 'Full name of the student',
    example: 'John Doe',
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
    description: 'Date of birth in ISO-8601 format',
    example: '2005-05-15T00:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsISO8601({ strict: true }, { message: 'Date of birth must be a valid ISO-8601 DateTime format (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)' })
  @Transform(({ value }) => {
    return normalizeISODate(value);
  })
  dob: string;

  @ApiProperty({
    description: 'Email address of the student',
    example: 'john.doe@student.school.com',
    type: String,
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiPropertyOptional({
    description: 'Gender of the student',
    enum: ['Male', 'Female', 'Other'],
    example: 'Male'
  })
  @IsOptional()
  @IsString()
  @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
  gender?: string;

  @ApiProperty({
    description: 'ID of the class the student belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @IsUUID('4', { message: 'Class ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Class ID is required' })
  classId: string;

  @ApiProperty({
    description: 'Name of the student\'s guardian/parent',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 100,
    type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'Guardian name is required' })
  @Length(2, 100, { message: 'Guardian name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  guardianName: string;

  @ApiProperty({
    description: 'Contact number of the student\'s guardian (10-15 digits)',
    example: '1234567890',
    pattern: '^[0-9]{10,15}$',
    type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'Guardian contact is required' })
  @Matches(/^[0-9]{10,15}$/, { message: 'Guardian contact must be a valid phone number (10-15 digits)' })
  guardianContact: string;

  @ApiPropertyOptional({
    description: 'Home address of the student',
    example: '123 Main Street, City, State, ZIP',
    minLength: 5,
    maxLength: 200,
    type: String
  })
  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  // This field is automatically populated by the system with the logged-in user's ID
  // Do not send this from the frontend
  @ValidateIf((o) => o.createdBy !== undefined && o.createdBy !== null)
  @IsString()
  @IsOptional()
  createdBy?: string;

  // This field is automatically populated by the system with the logged-in user's role
  // Do not send this from the frontend
  @ValidateIf((o) => o.createdByRole !== undefined && o.createdByRole !== null)
  @IsString()
  @IsOptional()
  createdByRole?: string;
}