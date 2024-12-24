import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(
    username: string,
    password: string,
  ): Promise<{ message: string; username: string }> {

    if (password.length < 6) {
      throw new BadRequestException('A senha deve ter no mínimo 6 caracteres');
    }

    const existingUser = await this.usersRepository.findOneBy({ username });
    if (existingUser) {
      throw new ConflictException('Usuário já cadastrado!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    const response = {
      message: 'Usuário cadastrado com sucesso',
      username,
    };

    return response;
  }

  async signIn(username: string, password: string): Promise<object> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }
    const payload = { username: user.username, sub: user.id };
    let response = {
      userId: user.id,
      username: user.username,
      token: this.jwtService.sign(payload),
    };

    return response;
  }
}
