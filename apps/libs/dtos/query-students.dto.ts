import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryStudentsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    type: Number
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    type: Number
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term for filtering students by name, email, roll number, or class',
    example: 'John',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific class',
    example: '10th Grade',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Class name must be a string' })
  className?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific section',
    example: 'A',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['fullName', 'email', 'class', 'section', 'rollNumber', 'createdAt'],
    example: 'fullName',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  @IsIn(['fullName', 'email', 'class', 'section', 'rollNumber', 'createdAt'], {
    message: 'Sort by must be one of: fullName, email, class, section, rollNumber, createdAt'
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Order must be a string' })
  @IsIn(['asc', 'desc'], { message: 'Order must be either asc or desc' })
  order?: 'asc' | 'desc' = 'desc';
}
