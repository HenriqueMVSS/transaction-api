import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Repository } from 'typeorm';
import { User } from './src/auth/user.entity';
import { Transaction } from './src/transactions/transaction.entity';
import { getRepositoryToken, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const transactionRepository = app.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  const hashedPassword = await bcrypt.hash('password1', 10);
  
  const users = [
    { username: 'user1', password: hashedPassword, balance: 1000 },
    { username: 'user2', password: hashedPassword, balance: 2000 },
    { username: 'user3', password: hashedPassword, balance: 3000 },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  const transactions = [
    { type: 'deposit', amount: 500, user: await userRepository.findOneBy({ username: 'user1' }) },
    { type: 'withdraw', amount: 200, user: await userRepository.findOneBy({ username: 'user2' }) },
    { type: 'transfer', amount: 300, user: await userRepository.findOneBy({ username: 'user3' }) },
  ];

  for (const transactionData of transactions) {
    const transaction = transactionRepository.create(transactionData);
    await transactionRepository.save(transaction);
  }

  await app.close();
}

bootstrap();