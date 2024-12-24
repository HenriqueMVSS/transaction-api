import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../auth/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectQueue('transactions') private transactionsQueue: Queue,
  ) {}

  async balance(loggedInUserId: number, userId: number): Promise<Array<object>> {
    if (loggedInUserId != userId) {
      throw new UnauthorizedException('Você só pode verificar o saldo da sua própria conta!');
    }

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('Usuário não encontrado!');
    }

    const response = [
      {
        username: user.username,
        saldo: `R$ ${user.balance}`,
      },
    ];

    return response;
  }

  async deposit(userId: number, amount: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    if (!user) {
      throw new Error('Usuário não encontrado!');
    }

    await this.transactionsQueue.add('transaction', {
      type: 'deposit',
      userId,
      amount,
    });
  }

  async processDeposit(userId: number, amount: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    user.balance += amount;
    await this.usersRepository.save(user);

    const transaction = this.transactionsRepository.create({
      type: 'deposit',
      amount,
      user,
    });

    await this.transactionsRepository.save(transaction);
  }

  async withdraw(loggedInUserId: number, userId: number, amount: number): Promise<void> {
    if (loggedInUserId != userId) {
      throw new UnauthorizedException('Você só pode realizar saque da sua própria conta');
    }

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('Usuário não encontrado!');
    }

    if (user.balance < amount) {
      throw new BadRequestException('Saldo insuficiente!');
    }
    
    await this.transactionsQueue.add('transaction', {
      type: 'withdraw',
      loggedInUserId,
      userId,
      amount,
    });
  }

  async processWithdraw(loggedInUserId: number, userId: number, amount: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    user.balance -= amount;
    await this.usersRepository.save(user);

    const transaction = this.transactionsRepository.create({
      type: 'withdraw',
      amount,
      user,
    });
    await this.transactionsRepository.save(transaction);
  }

  async transfer(loggedInUserId: number, fromUserId: number, toUserId: number, amount: number): Promise<void> {
    if (loggedInUserId != fromUserId) {
      throw new UnauthorizedException('Você só pode realizar transferência da sua própria conta!');
    }

    const fromUser = await this.usersRepository.findOneBy({ id: fromUserId });
    const toUser = await this.usersRepository.findOneBy({ id: toUserId });
    if (!fromUser || !toUser) {
      throw new Error('Usuário não encontrado!');
    }

    if (fromUser.balance < amount) {
      throw new BadRequestException('Saldo insuficiente!');
    }

    await this.transactionsQueue.add('transaction', {
      type: 'transfer',
      loggedInUserId,
      fromUserId,
      toUserId,
      amount,
    });
  }

  async processTransfer(loggedInUserId: number, fromUserId: number, toUserId: number, amount: number): Promise<void> {
    const fromUser = await this.usersRepository.findOneBy({ id: fromUserId });
    const toUser = await this.usersRepository.findOneBy({ id: toUserId });
 
    fromUser.balance -= amount;
    toUser.balance += amount;
    await this.usersRepository.save(fromUser);
    await this.usersRepository.save(toUser);

    const transaction = this.transactionsRepository.create({
      type: 'transfer',
      amount,
      user: fromUser,
    });
    await this.transactionsRepository.save(transaction);
  }
}