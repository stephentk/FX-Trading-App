// analytics/analytics.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionType} from '../transactions/entities/transaction.entity';
import { User, UserRole } from 'src/auth/entities/user.entity';



@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}
    async MakeAdmin(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('User is already an admin');
    }

    user.role = UserRole.ADMIN;
    return this.userRepository.save(user);
  }

  /**
   * Demote an admin back to user (optional)
   */
  async MakeUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user)
    { throw new NotFoundException('User not found');}

    user.role = UserRole.USER;
    return this.userRepository.save(user);
  }
async getAllUsers(page = 1, limit = 10) {
  const [users, total] = await this.userRepository.findAndCount({
    where: { isVerified: true }, // only verified users
    skip: (page - 1) * limit,
    take: limit,
    relations: ['wallet'],
    order: { createdAt: 'DESC' },
  });

  return {
    data: users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      isVerified: u.isVerified,
      role: u.role,
      createdAt: u.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
  /**
   * Find single user by id
   */
  async getUserById(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
  }

  async getUserTrades(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });

    if (!user) return null;

    const walletId = user.wallet?.id;
    if (!walletId) return { message: 'No wallet found for user' };

    const trades = await this.transactionRepository.find({
      where: { walletId, type: TransactionType.TRADE },
    });

    const totalTraded = trades.reduce((acc, tx) => acc + Number(tx.amount), 0);

    return {
      user: { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email },
      totalTrades: trades.length,
      totalTraded,
      lastTrade: trades.length ? trades[trades.length - 1] : null,
    };
  }


 

  // 3. Overall system analytics (all users)


  // analytics/analytics.service.ts
async getAllUsersTradesPaginated(page = 1, limit = 10) {
  const users = await this.userRepository.find({
    relations: ['wallet'],
    skip: (page - 1) * limit,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  const results: Array<{
    userId: string;
    name: string;
    totalTrades: number;
    totalTraded: number;
  }> = [];
  for (const user of users) {
    if (!user.wallet) continue;

    const trades = await this.transactionRepository.find({
      where: { walletId: user.wallet.id, type: TransactionType.TRADE },
    });

    results.push({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      totalTrades: trades.length,
      totalTraded: trades.reduce((acc, tx) => acc + Number(tx.amount), 0),
    });
  }

  const total = await this.userRepository.count();

  return {
    data: results,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
}