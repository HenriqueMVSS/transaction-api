import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async balance( loggedInUserId: number, userId: number): Promise<Array<object>> {
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
  async deposit(userId: number, amount: number): Promise<Array<object>> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }
    user.balance += amount;
    await this.usersRepository.save(user);

    const transaction = this.transactionsRepository.create({
      type: 'deposit',
      amount,
      user,
    });
    await this.transactionsRepository.save(transaction);
    const response = [
      {
        message: `Deposito de R$ ${transaction.amount} realizado com sucesso para o usuário ${transaction.user.username}!`,
      },
    ];
    return response;
  }

  async withdraw(
    loggedInUserId: number,
    userId: number,
    amount: number,
  ): Promise<Array<object>> {
    if (loggedInUserId != userId) {
      throw new UnauthorizedException(
        'Você só pode realizar saques da sua própria conta!',
      );
    }

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('Usuário não encontrado!');
    }

    if (user.balance <= 0) {
      throw new BadRequestException('Saldo insuficiente!');
    }

    if (user.balance >= amount) {
      user.balance -= amount;
      await this.usersRepository.save(user);

      const transaction = this.transactionsRepository.create({
        type: 'withdraw',
        amount,
        user,
      });
      await this.transactionsRepository.save(transaction);

      const response = [
        {
          message: `Saque de R$ ${transaction.amount} realizado com sucesso!`,
          username: transaction.user.username,
          saldo: transaction.user.balance,
        },
      ];

      return response;
    } else {
      throw new BadRequestException('Saldo insuficiente!');
    }
  }

  async transfer(loggedInUserId: number, fromUserId: number, toUserId: number, amount: number): Promise<Array<object>> {
    if (loggedInUserId != fromUserId) {
      throw new UnauthorizedException('Você só pode realizar transferências da sua própria conta!');
    }

    const fromUser = await this.usersRepository.findOneBy({ id: fromUserId });
    const toUser = await this.usersRepository.findOneBy({ id: toUserId });
    if (!fromUser || !toUser) {
      throw new Error('Usuário não encontrado!');
    }

    if (fromUser.balance < amount) {
      throw new BadRequestException('Saldo insuficiente!');
    }

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
    
    const response = [
      {
        message: `Transferência de R$ ${transaction.amount} realizada com sucesso!`,
        username: transaction.user.username,
        saldo: transaction.user.balance,
      },
    ];

    return response;
  }
}
