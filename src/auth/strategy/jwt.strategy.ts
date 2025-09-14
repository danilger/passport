// src/auth/jwt.strategy.ts
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(UserService) private readonly userService: UserService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req.cookies) {
          return null;
        }
        const token = req.cookies['access_token'];

        return token || null;
      },
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  /**
   * validate проверяет JWT токен и валидирует пользователя в БД с кэшированием на 1 час.
   * Это позволяет принудительно завершать сессии заблокированных пользователей
   * с максимальной задержкой в 1 час.
   */
  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub, {
      cache: { id: payload.sub, milliseconds: 1000 * 60 * 60 * 1 }, // запрос с кэшем на 1 час
    });

    if (!user.isActive) {
      return null;
    }

    return {
      userId: payload.sub,
      id: payload.id,
      username: payload.username,
      email: payload.email,
      fullName: payload.fullName,
      isActive: payload.isActive,
      isVerified: payload.isVerified,
      avatarUrl: payload.avatarUrl,
      phoneNumber: payload.phoneNumber,
      authProvider: payload.authProvider,
      locale: payload.locale,
      timezone: payload.timezone,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
