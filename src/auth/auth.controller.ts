import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify.dto';
import { Unauthenticated } from 'src/common/decorators/unauthenticated.decorators';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('register')
@Unauthenticated()
async register(@Body() registerDto: RegisterDto) {
  try {
    const result = await this.authService.register(registerDto);
    return {
      message: 'User registered successfully',
      data: result,
    };
  } catch (error) {
    console.error('Error during registration:', error);
    throw new HttpException(
      {
        message: 'Registration failed',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

@Post('verify')
@Unauthenticated()
async verify(@Body() verifyDto: VerifyOtpDto) {
  try {
    const user = await this.authService.verifyOtp(verifyDto);

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'Email verified successfully',
      email: user.email,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new HttpException(
      {
        message: 'OTP verification failed',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

@Post('login')
@Unauthenticated()
async login(@Body() loginDto: LoginDto) {
  try {
    const { access_token, user } = await this.authService.login(loginDto);

    return {
      message: 'Login successful',
      access_token,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  } catch (error) {
    console.error('Error during login:', error);

    throw new HttpException(
      {
        message: 'Login failed',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
