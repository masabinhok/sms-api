import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolDto } from './create-school.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {
    @ApiProperty({
    description: 'Unique identifier of the school to be updated',
    example: 'school-12345',
    type: String
    })
    @IsString()
    @IsNotEmpty()
    id: string;
}
