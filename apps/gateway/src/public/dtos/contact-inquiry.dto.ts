import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactInquiryDto {
  @ApiProperty({
    description: 'Full name of the person submitting the inquiry',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address for correspondence',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1-555-0123',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Subject of the inquiry',
    example: 'Admission Information',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Detailed message or inquiry',
    example: 'I would like to know more about the admission process for Grade 9.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;
}
