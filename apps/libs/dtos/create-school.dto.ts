import { IsString, IsEmail, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  // Basic Information
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tagline: string;

  @IsString()
  @IsNotEmpty()
  motto: string;

  // Contact Information
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // Social Media
  @IsString()
  @IsNotEmpty()
  facebook: string;

  @IsString()
  @IsNotEmpty()
  instagram: string;

  @IsString()
  @IsNotEmpty()
  twitter: string;

  @IsString()
  @IsNotEmpty()
  youtube: string;

  // About Information
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  mission: string;

  @IsString()
  @IsNotEmpty()
  vision: string;

  // Hero Section
  @IsString()
  @IsNotEmpty()
  heroTitle: string;

  @IsString()
  @IsNotEmpty()
  heroSubtitle: string;

  @IsString()
  @IsNotEmpty()
  heroCTA: string;
}