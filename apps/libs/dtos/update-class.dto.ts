import { IsString, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class UpdateClassDto {
    @ApiProperty({
        description: 'Class ID',
        example: 'class-uuid',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    id?: string;

    @ApiProperty({
        description: 'Class name',
        example: 'Grade 10',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Numeric grade level',
        example: 10,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(12)
    grade?: number;

    @ApiProperty({
        description: 'Section',
        example: 'A',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    section?: string;

    @ApiProperty({
        description: 'Maximum capacity',
        example: 40,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    capacity?: number;

    @ApiProperty({
        description: 'Academic year',
        example: '2024-2025',
        type: String,
        required: false
    })
    @IsString()
    @IsOptional()
    academicYear?: string;

    @ApiProperty({
        description: 'Class description',
        example: 'Updated description',
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
