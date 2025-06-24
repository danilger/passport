// src/auth/jwt.strategy.ts
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
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
   * validate работает только с payload из JWT токена и не делает никаких запросов к базе данных.
   */
  async validate(payload: any) {
    console.log('Validating payload:', payload);
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
