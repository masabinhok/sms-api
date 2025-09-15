import { IsNotEmpty, IsString, IsEmail, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class HandleTeacherCreatedDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @Transform(({ value }) => value?.trim())
  teacherId: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  dob: string;
}