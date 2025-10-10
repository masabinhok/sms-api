import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional data returned by the operation'
  })
  data?: any;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Logged In Successfully'
  })
  message: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Logged Out Successfully'
  })
  message: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Token Refreshed Successfully'
  })
  message: string;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'uuid-string-here'
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john.doe'
  })
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@school.com'
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: ['ADMIN', 'TEACHER', 'STUDENT'],
    example: 'STUDENT'
  })
  role: string;

  @ApiProperty({
    description: 'When the user account was created',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Additional profile information based on user role'
  })
  profile?: any;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Detailed error information',
    example: ['Field validation failed', 'Invalid input format']
  })
  details?: string[];

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/auth/login'
  })
  path: string;
}

export class AdminCreateProfileDto {
  @ApiProperty({
    description: 'Full name of the admin',
    example: 'John Admin',
    type: String
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the admin',
    example: 'admin@school.com',
    type: String,
    format: 'email'
  })
  email: string;
}