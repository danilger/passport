// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...rest } = user;
      
      // Преобразуем роли и разрешения в формат для токена
      const roles = user.roles?.map(role => role.name) || [];
      const permissions = user.roles?.flatMap(role => 
        role.permissions?.map(permission => permission.name) || []
      ).filter((value, index, self) => self.indexOf(value) === index) || []; // убираем дубликаты

      return {
        ...rest,
        roles,
        permissions
      };
    }
    return null;
  }

  async getTokens(payload: { sub: string; username: string; roles: string[]; permissions: string[] }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
