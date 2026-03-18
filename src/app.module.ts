import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { Otp } from './auth/entities/otp.entity';
import { RedisProvider } from './common/providers/redis.provider';
import { EmailModule } from './email/email.module';
import { FxModule } from './fx/fx.module';
import { TransactionModule } from './transactions/transactions.module';
import { WalletModule } from './wallet/wallet.module';
import { AdminModule } from './admin/admin.module';
import { Balance } from './wallet/entities/balance.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { Transaction } from './transactions/entities/transaction.entity';

console.log('DB_USERNAME:', process.env.DB_USERNAME);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // available in all modules
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Otp, Balance, Wallet, Transaction], // add more entities later
        synchronize: true, // only dev
      }),
    }),

    AuthModule,
    EmailModule,
    FxModule,
    TransactionModule,
    WalletModule,
    AdminModule
  ],

  providers: [RedisProvider],
  exports: [RedisProvider],
})
export class AppModule {}
