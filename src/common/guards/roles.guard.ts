// src/common/guards/roles.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../decorators/roles.decorator';
  import * as jwt from 'jsonwebtoken';
  
  /**
   * Guard для проверки ролей пользователя
   * 
   * @description
   * Проверяет наличие необходимых ролей у пользователя:
   * 1. Получает требуемые роли из метаданных через декоратор @Roles()
   * 2. Извлекает роли пользователя из JWT токена в куках
   * 3. Сравнивает роли пользователя с требуемыми ролями
   * 
   * @throws {ForbiddenException} Если у пользователя нет необходимых ролей
   * 
   * @important Должен использоваться совместно с декоратором @Roles(...roles: string[])
   * 
   * @usage
   * ```typescript
   * @Roles('admin')
   * @UseGuards(RolesGuard)
   * async adminEndpoint() {}
   * ```
   */
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [
          context.getHandler(), // метод
          context.getClass(),   // контроллер
        ],
      );
  
      if (!requiredRoles || requiredRoles.length === 0) {
        return true; // если роли не заданы — маршрут общедоступный
      }
  
      const request = context.switchToHttp().getRequest();
      
      // Получаем JWT токен из кук
      const token = request.cookies?.access_token;
      
      if (!token) {
        throw new ForbiddenException('Токен отсутствует');
      }

      try {
     
        // Декодируем JWT токен
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || '') as { roles: string[] };
 
        
        // Проверяем наличие ролей
        if (!decoded.roles || !Array.isArray(decoded.roles)) {
          throw new ForbiddenException('Роли не найдены в токене');
        }

        // Проверяем соответствие ролей
        const hasRole = decoded.roles.some((role: string) =>
          requiredRoles.includes(role),
        );
  
        if (!hasRole) {
          throw new ForbiddenException('Недостаточно прав');
        }
  
        return true;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        throw new ForbiddenException('Невалидный токен');
      }
    }
  }
  