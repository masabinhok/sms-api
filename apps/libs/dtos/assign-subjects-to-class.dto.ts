import { IsString, IsArray, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class SubjectAssignment {
    @ApiProperty({
        description: 'Subject ID to assign',
        example: 'subject-uuid',
        type: String
    })
    @IsString()
    subjectId: string;

    @ApiProperty({
        description: 'Whether the subject is compulsory for this class',
        example: true,
        type: Boolean,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isCompulsory?: boolean;

    @ApiProperty({
        description: 'Number of weekly periods for this subject',
        example: 5,
        type: Number,
        required: false
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    weeklyPeriods?: number;
}

export class AssignSubjectsToClassDto {
    @ApiProperty({
        description: 'Class ID to assign subjects to',
        example: 'class-uuid',
        type: String
    })
    @IsString()
    classId: string;

    @ApiProperty({
        description: 'Array of subjects to assign with their settings',
        type: [SubjectAssignment],
        isArray: true
    })
    @IsArray()
    subjects: SubjectAssignment[];
}
