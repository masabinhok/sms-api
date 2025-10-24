import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class UpdateSchoolDto {
    @ApiProperty({
        description: 'Unique identifier of the school to be updated',
        example: 'school-12345',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    // Basic Information
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    tagline?: string;

    @IsString()
    @IsOptional()
    motto?: string;

    // Contact Information
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    // Social Media
    @IsString()
    @IsOptional()
    facebook?: string;

    @IsString()
    @IsOptional()
    instagram?: string;

    @IsString()
    @IsOptional()
    twitter?: string;

    @IsString()
    @IsOptional()
    youtube?: string;

    // About Information
    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    mission?: string;

    @IsString()
    @IsOptional()
    vision?: string;

    // Hero Section
    @IsString()
    @IsOptional()
    heroTitle?: string;

    @IsString()
    @IsOptional()
    heroSubtitle?: string;

    @IsString()
    @IsOptional()
    heroCTA?: string;
}
