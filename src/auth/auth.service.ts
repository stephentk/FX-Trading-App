import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/entities/user.entity';
import { Otp } from 'src/auth/entities/otp.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { EmailService } from 'src/email/email.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {

    let email = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findOne({
      where: { email:email },
    });

    
    if (existingUser?.isVerified) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let userToVerify: User;

    if (!existingUser) {

      const user = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: email,
        password: hashedPassword,
        isVerified: false,
      });
   await this.userRepository.save(user);
      // Create wallet for user
      const wallet = this.walletRepo.create({ user });
      await this.walletRepo.save(wallet);
      user.wallet = wallet;

    
      await this.userRepository.save(user);
      userToVerify = user;
    } else {
      
      userToVerify = existingUser;
    }

    await this.sendVerificationOtp(userToVerify);

    return {
      message: 'User registered successfully. Check your email for OTP.',
      email: userToVerify.email,
    };
  }

  private async sendVerificationOtp(user: User): Promise<void> {


    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    const otp = this.otpRepository.create({
      userId: user.id,
      code,
      expiresAt,
      isUsed: false,
    });

    await this.otpRepository.save(otp);

    console.log(
      `Generated OTP for ${user.email}: ${code} (expires at ${expiresAt})`,
    );

    await this.emailService.sendOtp(user.email, code);

    // TODO: Replace with real email sending
    console.log(
      `[EMAIL SIMULATION] To: ${user.email} | OTP: ${code} | Expires: ${expiresAt}`,
    );
  }

  async verifyOtp(dto: { email: string; code: string }) {
     let email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account already verified');
    }

    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code: dto.code,
        isUsed: false,
        expiresAt: MoreThan(new Date()), // TypeORM raw > comparison
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      return null; // invalid/expired/used
    }

    // Mark OTP as used
    otp.isUsed = true;
    otp.usedAt = new Date();
    await this.otpRepository.save(otp);

    // Verify user
    user.isVerified = true;
    await this.userRepository.save(user);

    return user;
  }

  async login(dto: LoginDto) {
    let email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET not defined in .env');

    const expiry = this.configService.get<number>('JWT_EXPIRATION') || '1h';

    const access_token = this.jwtService.sign<JwtPayload>(
      { sub: user.id, email: user.email },
      { secret, expiresIn: expiry },
    );
   

    await this.userRepository.save(user);

    return { access_token, user };
  }
  async getUserByid(id: string) {

        const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['wallet'], 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
