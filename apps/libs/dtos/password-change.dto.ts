import { 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  Matches 
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PasswordChangeDto {
  @IsString({ message: 'Old password must be a string' })
  @IsNotEmpty({ message: 'Old password is required' })
  @Transform(({ value }) => value?.trim())
  oldPassword: string;

  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}