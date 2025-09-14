// src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); // по умолчанию username/password
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Неверное имя пользователя или пароль');
    return user;
  }
}
