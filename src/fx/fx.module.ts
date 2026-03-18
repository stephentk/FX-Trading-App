import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxService } from '../fx/fx.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { RedisProvider } from 'src/common/providers/redis.provider';
import { FxController } from '../fx/fx.controller';

@Module({
  controllers: [FxController],
  providers: [FxService, RedisProvider],
})
export class FxModule {}
