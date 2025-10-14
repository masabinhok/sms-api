import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTeachersDto {
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
    description: 'Search term for filtering teachers by name, email, or phone',
    example: 'Sarah',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific subject taught',
    example: 'MATH',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Subject must be a string' })
  subject?: string;

  @ApiPropertyOptional({
    description: 'Filter by specific class taught',
    example: 'TENTH',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Class must be a string' })
  class?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['fullName', 'email', 'phone', 'createdAt'],
    example: 'fullName',
    type: String
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  @IsIn(['fullName', 'email', 'phone', 'createdAt'], {
    message: 'Sort by must be one of: fullName, email, phone, createdAt'
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
