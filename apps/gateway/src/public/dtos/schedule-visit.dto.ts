import { IsEmail, IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleVisitDto {
  @ApiProperty({
    description: 'Full name of the visitor',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the visitor',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1-555-0456',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Preferred date for the visit (ISO format)',
    example: '2025-12-15',
  })
  @IsDateString()
  @IsNotEmpty()
  preferredDate: string;

  @ApiProperty({
    description: 'Preferred time for the visit',
    example: '10:00 AM',
  })
  @IsString()
  @IsNotEmpty()
  preferredTime: string;

  @ApiProperty({
    description: 'Number of visitors',
    example: '2',
  })
  @IsString()
  @IsNotEmpty()
  numberOfVisitors: string;

  @ApiPropertyOptional({
    description: 'Additional notes or requirements',
    example: 'Interested in science lab facilities',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
