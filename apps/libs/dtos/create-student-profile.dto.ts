import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsIn, 
  Length, 
  Matches,
  IsISO8601
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateStudentProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsISO8601({ strict: true }, { message: 'Date of birth must be a valid ISO-8601 DateTime format (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD)' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // If it's just a date (YYYY-MM-DD), convert to ISO-8601 DateTime
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(value + 'T00:00:00.000Z').toISOString();
      }
      // If it's already an ISO string, validate and return
      try {
        return new Date(value).toISOString();
      } catch {
        return value; // Let validator handle the error
      }
    }
    return value;
  })
  dob: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsOptional()
  @IsString()
  @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
  gender?: string;

  @IsString()
  @IsNotEmpty({ message: 'Class is required' })
  @Transform(({ value }) => value?.trim())
  class: string;

  @IsString()
  @IsNotEmpty({ message: 'Section is required' })
  @Length(1, 5, { message: 'Section must be between 1 and 5 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  section: string;

  @IsString()
  @IsNotEmpty({ message: 'Roll number is required' })
  @Matches(/^[0-9]+$/, { message: 'Roll number must contain only numbers' })
  rollNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Guardian name is required' })
  @Length(2, 100, { message: 'Guardian name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  guardianName: string;

  @IsString()
  @IsNotEmpty({ message: 'Guardian contact is required' })
  @Matches(/^[0-9]{10,15}$/, { message: 'Guardian contact must be a valid phone number (10-15 digits)' })
  guardianContact: string;

  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  @Transform(({ value }) => value?.trim())
  address?: string;
}