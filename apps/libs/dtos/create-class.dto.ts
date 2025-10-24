import { IsString, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreateClassDto {
    @ApiProperty({
        description: 'Class name (e.g., "Grade 1", "Class 10", "Nursery")',
        example: 'Grade 10',
        type: String
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Numeric grade level (0 for pre-primary, 1-12 for grades)',
        example: 10,
        type: Number
    })
    @IsInt()
    @Min(0)
    @Max(12)
    grade: number;

    @ApiProperty({
        description: 'Section (e.g., "A", "B", "C") - optional',
        example: 'A',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    section?: string;

    @ApiProperty({
        description: 'Maximum number of students allowed',
        example: 40,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    capacity?: number;

    @ApiProperty({
        description: 'Academic year (e.g., "2024-2025")',
        example: '2024-2025',
        type: String
    })
    @IsString()
    academicYear: string;

    @ApiProperty({
        description: 'Class description',
        example: 'Grade 10 Section A - Science Stream',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Whether the class is active',
        example: true,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
