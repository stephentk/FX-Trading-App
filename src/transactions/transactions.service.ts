import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async logTransaction(
    dto: CreateTransactionDto,
    data?: EntityManager,
  ): Promise<Transaction> {
    const repo = data ? data.getRepository(Transaction) : this.transactionRepo;
    const transaction = repo.create(dto);
    return repo.save(transaction);
  }
  async getTransactions(walletId: string): Promise<Transaction[]> {
    return this.transactionRepo.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }
}
