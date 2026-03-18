import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TransactionService } from 'src/transactions/transactions.service';
import { TransactionController } from './transactions.controller';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
