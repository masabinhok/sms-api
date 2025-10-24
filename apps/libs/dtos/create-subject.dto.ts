import { IsString, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreateSubjectDto {
    @ApiProperty({
        description: 'Subject name (e.g., "Mathematics", "English", "Science")',
        example: 'Mathematics',
        type: String
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Subject code (e.g., "MATH101", "ENG101")',
        example: 'MATH101',
        type: String
    })
    @IsString()
    code: string;

    @ApiProperty({
        description: 'Subject description',
        example: 'Advanced mathematics covering algebra, geometry, and calculus',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Subject category (e.g., "Core", "Elective", "Extra-curricular")',
        example: 'Core',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({
        description: 'Credit hours for the subject',
        example: 4,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    creditHours?: number;

    @ApiProperty({
        description: 'Full marks for the subject',
        example: 100,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    fullMarks?: number;

    @ApiProperty({
        description: 'Pass marks for the subject',
        example: 40,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    passMarks?: number;

    @ApiProperty({
        description: 'Whether the subject has theory component',
        example: true,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    hasTheory?: boolean;

    @ApiProperty({
        description: 'Whether the subject has practical component',
        example: false,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    hasPractical?: boolean;

    @ApiProperty({
        description: 'Theory marks (if theory/practical are separate)',
        example: 80,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    theoryMarks?: number;

    @ApiProperty({
        description: 'Practical marks (if theory/practical are separate)',
        example: 20,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    practicalMarks?: number;

    @ApiProperty({
        description: 'Whether the subject is active',
        example: true,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
