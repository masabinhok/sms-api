import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BrochureRequestDto {
  @ApiProperty({
    description: 'Full name of the requester',
    example: 'Michael Johnson',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address to send the brochure',
    example: 'michael.johnson@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1-555-0789',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
