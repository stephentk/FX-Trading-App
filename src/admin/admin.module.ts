import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { AnalyticsController } from './admin.controller';
import { AnalyticsService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AdminModule {}
