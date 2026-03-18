import { IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import {
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNotEmpty()
  walletId: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType; // FUND, CONVERT, TRADE

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  currencyCode: string; // NGN, USD, EUR, etc.

  @IsOptional()
  @IsNumber()
  rateUsed?: number;

  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus; // SUCCESS, FAILED
}
