import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { Balance } from './entities/balance.entity';
import { FxService } from '../fx/fx.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionService } from 'src/transactions/transactions.service';
import { RedisProvider } from 'src/common/providers/redis.provider';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Otp } from 'src/auth/entities/otp.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Balance, Transaction, User,Otp]),
    forwardRef(() => AuthModule),
  ],
  controllers: [WalletController],
  providers: [WalletService, FxService, TransactionService, AuthService, RedisProvider,JwtService,EmailService ],
})
export class WalletModule {}
