import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Balance } from './entities/balance.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import { FxService } from '../fx/fx.service';
import { CreateTransactionDto } from 'src/transactions/dto/transaction.dto';
import { TransactionService } from 'src/transactions/transactions.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(Balance) private balanceRepo: Repository<Balance>,
    // @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    private fxService: FxService,
    private dataSource: DataSource,
    private transactionService: TransactionService,
  ) {}

  /** Get all balances for a wallet */
  async getBalances(walletId: string) {
    const balances = await this.balanceRepo.find({ where: { walletId } });
    return balances.reduce((acc, b) => {
      acc[b.currencyCode] = Number(b.amount);
      return acc;
    }, {});
  }

  /** Fund wallet */
  async fund(walletId: string, amount: number, currencyCode: string) {
    if (amount <= 0) throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);

    return this.dataSource.transaction(async data => {
      let balance = await data.findOne(Balance, { where: { walletId, currencyCode } });
      if (!balance) {
        balance = data.create(Balance, { walletId, currencyCode, amount });
      } else {
        balance.amount = Number(balance.amount) + amount;
      }
      await data.save(balance);



       const txDto: CreateTransactionDto = {
        walletId,
        type: TransactionType.FUND,
        amount,
        currencyCode,
        status: TransactionStatus.SUCCESS,
      };

      // Use manager so it participates in the same transaction
      const tx = await this.transactionService.logTransaction(txDto, data);


      return { balance, transaction: tx };
    });
  }

 

async convert(
  walletId: string,
  fromCurrency: string,
  toCurrency: string,
  amount: number,
) {
  if (amount <= 0)
    throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);

  return this.dataSource.transaction(async data => {
    // 1️⃣ Fetch user's balance for source currency
    const fromBalance = await data.findOne(Balance, {
      where: { walletId, currencyCode: fromCurrency },
    });

    if (!fromBalance || Number(fromBalance.amount) < amount) {
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    // 2️⃣ Calculate converted amount using FX service
    const convertedAmount = await this.fxService.convert(
      amount,
      fromCurrency,
      toCurrency,
    );

    // 3️⃣ Fetch or create target currency balance
    let toBalance = await data.findOne(Balance, {
      where: { walletId, currencyCode: toCurrency },
    });

    if (!toBalance) {
      toBalance = data.create(Balance, {
        walletId,
        currencyCode: toCurrency,
        amount: convertedAmount,
      });
    } else {
      toBalance.amount = Number(toBalance.amount) + convertedAmount;
    }

    // 4️⃣ Deduct from source balance
    fromBalance.amount = Number(fromBalance.amount) - amount;

    // 5️⃣ Save balances atomically
    await data.save([fromBalance, toBalance]);

    // 6️⃣ Log transaction
    const txDto: CreateTransactionDto = {
      walletId,
      type: TransactionType.CONVERT, // NOTE: should be CONVERT, not FUND
      amount,
      currencyCode: fromCurrency,
      rateUsed: convertedAmount / amount,
      status: TransactionStatus.SUCCESS,
    };

    // Pass manager so it participates in the same DB transaction
    const tx = await this.transactionService.logTransaction(txDto,data);

    return { fromBalance, toBalance, transaction: tx };
  });
}

async trade(walletId: string, fromCurrency: string, toCurrency: string, amount: number) {
  // Validate allowed trade pair
  if (!['NGN', fromCurrency].includes(fromCurrency) && !['NGN', toCurrency].includes(toCurrency)) {
    throw new HttpException('Trade only allowed between NGN and other currencies', HttpStatus.BAD_REQUEST);
  }

  if (amount <= 0) throw new HttpException('Invalid amount', HttpStatus.BAD_REQUEST);

  return this.dataSource.transaction(async data => {
    // Fetch source balance
    const fromBalance = await data.findOne(Balance, { where: { walletId, currencyCode: fromCurrency } });
    if (!fromBalance || Number(fromBalance.amount) < amount) 
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);

    // Convert using FX service
    const convertedAmount = await this.fxService.convert(amount, fromCurrency, toCurrency);

    // Fetch or create target balance
    let toBalance = await data.findOne(Balance, { where: { walletId, currencyCode: toCurrency } });
    if (!toBalance) {
      toBalance = data.create(Balance, { walletId, currencyCode: toCurrency, amount: convertedAmount });
    } else {
      toBalance.amount = Number(toBalance.amount) + convertedAmount;
    }

    // Deduct from source
    fromBalance.amount = Number(fromBalance.amount) - amount;
    await data.save([fromBalance, toBalance]);

    // Log transaction
    const txDto: CreateTransactionDto = {
      walletId,
      type: TransactionType.TRADE,
      amount,
      currencyCode: fromCurrency,
      rateUsed: convertedAmount / amount,
      status: TransactionStatus.SUCCESS,
    };
    const tx = await this.transactionService.logTransaction(txDto, data);

    return { fromBalance, toBalance, transaction: tx };
  });
}


}