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
  type: TransactionType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  currencyCode: string; 

  @IsOptional()
  @IsNumber()
  rateUsed?: number;

  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus; 
}
