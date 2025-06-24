// src/auth/auth.service.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

/** Тип пользователя с ролями и разрешениями без пароля который добавляется Request.user посел валидации пользователя */
export type UserWithRolesAndPermissions = Omit<
  User,
  'roles' | 'password' | 'hashPassword' | 'comparePassword'
> & {
  roles: string[];
  permissions: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService)) // Исправляем здесь
    private readonly userService: UserService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserWithRolesAndPermissions | null> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...rest } = user;

      // Преобразуем роли и разрешения в формат для токена
      const rolesNames = user.roles?.map((role) => role.name) || [];
      const permissions =
        user.roles
          ?.flatMap(
            (role) =>
              role.permissions?.map((permission) => permission.name) || [],
          )
          .filter((value, index, self) => self.indexOf(value) === index) || []; // убираем дубликаты

      return {
        ...rest,
        roles: rolesNames,
        permissions,
      };
    }
    return null;
  }

  async getTokens(payload: {
    sub: string;
    username: string;
    permissions: string[];
    roles: string[];
  }) {
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
