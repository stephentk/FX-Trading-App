import { BadRequestException, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../auth/entities/user.entity';
import { TransactionService } from './transactions.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Get all transactions for logged-in user
@Get()
async getUserTransactions(
  @GetUser('id') userId: string,
) {
  try {
    // Fetch full user including wallet
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.wallet) {
      throw new BadRequestException('User wallet not found');
    }

    console.log('Get transactions request for user:', user.id);

    // Call transaction service with wallet ID
    const transactions = await this.transactionService.getTransactions(user.wallet.id);

    return {
      message: 'Transactions fetched successfully',
      data: transactions,
    };
  } catch (error) {
    console.error('Error fetching user transactions:', error);

    // Preserve known exceptions (like BadRequestException)
    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new HttpException(
      {
        message: 'Failed to fetch transactions',
        error: error?.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
