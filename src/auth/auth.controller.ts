import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body('username') username: string, @Body('password') password: string) {
    return await this.authService.signUp(username, password);
  }

  @Post('signin')
  async signIn(@Body('username') username: string, @Body('password') password: string) {
    return this.authService.signIn(username, password);
  }
}