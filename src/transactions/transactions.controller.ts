import { Controller, Post, Body, Param, UseGuards, Request, Get, HttpException, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Transações')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Saldo do usuário' })
  @ApiResponse({ status: 200, description: 'Saldo visualizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Get('balance/:userId')
  async balance(@Request() req, @Param('userId') userId: number) {
    const loggedInUserId = req.user.userId;
    return await this.transactionsService.balance(loggedInUserId, userId);
  }

  @ApiOperation({ summary: 'Deposito' })
  @ApiResponse({ status: 201, description: 'Depósito realizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100, description: 'O valor a depositar' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('deposit/:userId')
  async deposit(@Param('userId') userId: number, @Body('amount') amount: number) {
    try {
      await this.transactionsService.deposit(userId, amount);
      return { message: `Depósito de R$ ${amount} realizado com sucesso.` };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Saque' })
  @ApiResponse({ status: 201, description: 'Saque realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100, description: 'The amount to withdraw' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('withdraw/:userId')
  async withdraw(@Request() req, @Param('userId') userId: number, @Body('amount') amount: number) {
    const loggedInUserId = req.user.userId;
    try {
      await this.transactionsService.withdraw(loggedInUserId, userId, amount);
      return { message: `Saque de R$ ${amount} realizado com sucesso.` };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Transferência' })
  @ApiResponse({ status: 201, description: 'Transferência solicitada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100, description: 'O valor a ser transferido' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('transfer/:fromUserId/:toUserId')
  async transfer(@Request() req, @Param('fromUserId') fromUserId: number, @Param('toUserId') toUserId: number, @Body('amount') amount: number) {
    const loggedInUserId = req.user.userId;
    try {
      await this.transactionsService.transfer(loggedInUserId, fromUserId, toUserId, amount);
      return { message: `Transferência de R$ ${amount} realizada com sucesso.` };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}