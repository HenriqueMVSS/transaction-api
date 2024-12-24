import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Cadastre um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'user1', description: 'O nome de usuário do usuário' },
        password: { type: 'string', example: 'password1', description: 'A senha do usuário' },
      },
    },
  })
  @Post('signup')
  async signUp(@Body('username') username: string, @Body('password') password: string) {
    return await this.authService.signUp(username, password);
  }

  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário logado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'user1', description: 'O nome de usuário do usuário' },
        password: { type: 'string', example: 'password1', description: 'A senha do usuário' },
      },
    },
  })
  @Post('signin')
  async signIn(@Body('username') username: string, @Body('password') password: string) {
    return this.authService.signIn(username, password);
  }
}