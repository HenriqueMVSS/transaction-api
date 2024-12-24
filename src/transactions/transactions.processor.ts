import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionsService } from './transactions.service';

@Processor('transactions')
export class TransactionsProcessor {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Process('transaction')
  async handleTransaction(job: Job) {
    const { type, userId, amount, loggedInUserId } = job.data;
    if (type === 'balance') {
      await this.transactionsService.balance(loggedInUserId, userId);
    } else if (type === 'deposit') {
      await this.transactionsService.deposit(userId, amount);
    } else if (type === 'withdraw') {
      await this.transactionsService.withdraw(loggedInUserId, userId, amount);
    } else if (type === 'transfer') {
      const { toUserId } = job.data;
      await this.transactionsService.transfer(loggedInUserId, userId, toUserId, amount);
    }
  }
}