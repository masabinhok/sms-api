import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsDateString, 
  IsArray, 
  IsEnum, 
  IsOptional, 
  IsIn, 
  Length, 
  Matches 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Gender is required' })
  @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
  gender: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[0-9]{10,15}$/, { message: 'Phone number must be a valid number (10-15 digits)' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 200, { message: 'Address must be between 5 and 200 characters' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  @Type(() => Date)
  dob: Date;

  @IsArray({ message: 'Subjects must be an array' })
  @IsEnum(Subject, { each: true, message: 'Each subject must be a valid subject' })
  @IsOptional()
  subjects?: Subject[];

  @IsArray({ message: 'Classes must be an array' })
  @IsEnum(Class, { each: true, message: 'Each class must be a valid class' })
  @IsOptional()
  classes?: Class[];
}