// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// ← make sure this file exists      // ← for real email sending
import { JwtStrategy } from './jwt.strategy';
import { EmailModule } from 'src/email/email.module';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Balance } from 'src/wallet/entities/balance.entity';
import { FxService } from 'src/fx/fx.service';
import { TransactionService } from 'src/transactions/transactions.service';
import { RedisProvider } from 'src/common/providers/redis.provider';
import { Transaction } from 'typeorm';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth-guard';

@Module({
  imports: [
    // Database entities for User & OTP
    TypeOrmModule.forFeature([User, Otp, Wallet, Balance]),

    // Passport + JWT configuration
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_EXPIRATION') || '3600',
            10,
          ),
        },
      }),
      inject: [ConfigService],
    }),

    EmailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    // WalletService,
    FxService,
    // TransactionService,
    RedisProvider,
    JwtAuthGuard, // ← registers the strategy used by AuthGuard('jwt')
  ],

  // Export AuthService so other modules (e.g. WalletModule) can inject it
  // if they need to check user existence, get user by id, etc.
  exports: [AuthService],
})
export class AuthModule {}
