import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({ length: 3 })
  currencyCode: string; // NGN, USD, EUR, GBP

  @Column('decimal', { precision: 18, scale: 4, default: 0 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
