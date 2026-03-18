import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Otp } from 'src/auth/entities/otp.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
    eager: true,
  })
  wallet: Wallet;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}
