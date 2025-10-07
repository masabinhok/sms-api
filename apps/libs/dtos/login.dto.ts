import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from 'apps/auth/generated/prisma';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  @IsEnum(Role, { 
    message: 'Role must be one of: ADMIN, TEACHER, STUDENT' 
  })
  role: Role;
}