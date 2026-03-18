import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum TransactionType {
  FUND = 'FUND',
  CONVERT = 'CONVERT',
  TRADE = 'TRADE',
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  amount: number;

  @Column({ length: 3 })
  currencyCode: string; // currency involved in the transaction

  @Column('decimal', { precision: 18, scale: 8, nullable: true })
  rateUsed?: number; // only for conversion/trade

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
