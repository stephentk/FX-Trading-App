import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
export class CreateAdminDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

}