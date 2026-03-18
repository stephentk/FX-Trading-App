import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  @Matches(/^[A-Za-z]+$/, {
    message: 'First name must contain only letters',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  @Matches(/^[A-Za-z]+$/, {
    message: 'Last name must contain only letters',
  })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
