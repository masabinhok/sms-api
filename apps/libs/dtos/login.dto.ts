import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'apps/auth/generated/prisma';

export class LoginDto {
  @ApiProperty({
    description: 'Username for authentication',
    example: 'john.doe',
    minLength: 1,
    type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 6,
    type: String,
    format: 'password'
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: Role,
    example: Role.STUDENT,
    enumName: 'Role'
  })
  @IsNotEmpty()
  @IsEnum(Role, { 
    message: 'Role must be one of: ADMIN, TEACHER, STUDENT' 
  })
  role: Role;
}