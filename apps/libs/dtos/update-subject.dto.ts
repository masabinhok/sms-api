import { IsString, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class UpdateSubjectDto {
    @ApiProperty({
        description: 'Subject ID',
        example: 'subject-uuid',
        type: String
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Subject name',
        example: 'Mathematics',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Subject code',
        example: 'MATH101',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({
        description: 'Subject description',
        example: 'Updated description',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Subject category',
        example: 'Core',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({
        description: 'Credit hours',
        example: 4,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    creditHours?: number;

    @ApiProperty({
        description: 'Full marks',
        example: 100,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    fullMarks?: number;

    @ApiProperty({
        description: 'Pass marks',
        example: 40,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    passMarks?: number;

    @ApiProperty({
        description: 'Has theory component',
        example: true,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    hasTheory?: boolean;

    @ApiProperty({
        description: 'Has practical component',
        example: false,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    hasPractical?: boolean;

    @ApiProperty({
        description: 'Theory marks',
        example: 80,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    theoryMarks?: number;

    @ApiProperty({
        description: 'Practical marks',
        example: 20,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    practicalMarks?: number;

    @ApiProperty({
        description: 'Is active',
        example: true,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
