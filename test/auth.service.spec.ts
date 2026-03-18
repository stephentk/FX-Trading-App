import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { Wallet } from 'src/wallet/entities/wallet.entity';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { Otp } from 'src/auth/entities/otp.entity';


describe('AuthService - register', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let walletRepo: jest.Mocked<Repository<Wallet>>;
  let otpRepo: jest.Mocked<Repository<Otp>>;

//   beforeEach(async () => {


//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
//         },
//         {
//           provide: getRepositoryToken(Wallet),
//           useValue: { create: jest.fn(), save: jest.fn() },
//         },
//         {
//           provide: getRepositoryToken(Otp),
//           useValue: { create: jest.fn(), save: jest.fn() },
//         },
//         {
//           provide: 'EmailService',
//           useValue: { sendOtp: jest.fn() },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     userRepo = module.get(getRepositoryToken(User));
//     walletRepo = module.get(getRepositoryToken(Wallet));
//     otpRepo = module.get(getRepositoryToken(Otp));
//   });

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: getRepositoryToken(User),
        useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
      },
      {
        provide: getRepositoryToken(Wallet),
        useValue: { create: jest.fn(), save: jest.fn() },
      },
      {
        provide: getRepositoryToken(Otp),
        useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
      },

      // ✅ ADD THIS
      {
        provide: JwtService,
        useValue: { sign: jest.fn() },
      },

      // ✅ ADD THIS (you are using configService.get)
      {
        provide: ConfigService,
        useValue: { get: jest.fn() },
      },

      {
        provide: EmailService,
        useValue: { sendOtp: jest.fn() },
      },
    ],
  }).compile();

  service = module.get<AuthService>(AuthService);
      userRepo = module.get(getRepositoryToken(User));
    walletRepo = module.get(getRepositoryToken(Wallet));
    otpRepo = module.get(getRepositoryToken(Otp));
});

  it('should create new user and wallet when email does not exist', async () => {
    const dto = { firstName: 'Test', lastName: 'User', email: 'test@test.com', password: 'password123' };

    // No existing user
    userRepo.findOne.mockResolvedValue(null);

    // Mock create/save for User
    const createdUser = { ...dto, id: 'uuid1', isVerified: false } as User;
    userRepo.create.mockReturnValue(createdUser);
    userRepo.save.mockResolvedValue(createdUser);

    // Mock wallet creation
    const createdWallet = { id: 'wallet1', user: createdUser } as Wallet;
    walletRepo.create.mockReturnValue(createdWallet);
    walletRepo.save.mockResolvedValue(createdWallet);

    // Spy on sendVerificationOtp
    const sendOtpSpy = jest.spyOn(service as any, 'sendVerificationOtp').mockResolvedValue(undefined);

    const result = await service.register(dto);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
    expect(userRepo.create).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
    expect(walletRepo.create).toHaveBeenCalledWith({ user: createdUser });
    expect(walletRepo.save).toHaveBeenCalled();
    expect(sendOtpSpy).toHaveBeenCalledWith(createdUser);

    expect(result).toEqual({
      message: 'User registered successfully. Check your email for OTP.',
      email: createdUser.email,
    });
  });


  it('should throw error if user already verified', async () => {
    const verifiedUser = { id: 'uuid2', email: 'verified@test.com', isVerified: true } as User;
    userRepo.findOne.mockResolvedValue(verifiedUser);

    await expect(
      service.register({
        firstName: 'Test',
        lastName: 'User',
        email: verifiedUser.email,
        password: 'password123',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});