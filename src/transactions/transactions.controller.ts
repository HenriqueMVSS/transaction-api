import { Controller, Post, Body, Param, UseGuards, Request, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance/:userId')
  async balance(@Request() req, @Param('userId') userId: number) {
    const loggedInUserId = req.user.userId;
    return await this.transactionsService.balance(loggedInUserId, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('deposit/:userId')
  async deposit(@Param('userId') userId: number, @Body('amount') amount: number) {
    return await this.transactionsService.deposit(userId, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw/:userId')
  async withdraw(@Request() req, @Param('userId') userId: number, @Body('amount') amount: number) {
    const loggedInUserId = req.user.userId;
    return this.transactionsService.withdraw(loggedInUserId, userId, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer/:fromUserId/:toUserId')
  async transfer(@Request() req, @Param('fromUserId') fromUserId: number, @Param('toUserId') toUserId: number, @Body('amount') amount: number) {
    const loggedInUserId = req.user.userId;
    return this.transactionsService.transfer(loggedInUserId, fromUserId, toUserId, amount);
  }
}