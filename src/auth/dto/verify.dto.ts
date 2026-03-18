import { IsEmail, IsNotEmpty, Length, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  code: string;
}
