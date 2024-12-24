import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './transaction.entity';
import { User } from '../auth/user.entity';
import { BullModule } from '@nestjs/bull';
import { TransactionsProcessor } from './transactions.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User]),
    BullModule.registerQueue({
      name: 'transactions',
    }),
  ],
  providers: [TransactionsService, TransactionsProcessor],
  controllers: [TransactionsController],
})
export class TransactionsModule {}