import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { Reflector } from '@nestjs/core';
import { UserWithRolesAndPermissions } from 'src/auth/auth.service';


/**
 * Guard для проверки прав доступа пользователя к ресурсам.
 * 
 * @description
 * Проверяет наличие необходимых разрешений у пользователя для доступа к защищенным маршрутам.
 * Разрешения могут быть определены как на уровне метода, так и на уровне контроллера.
 * 
 * @example
 * ```typescript
 * @RequirePermissions('create:user','delete:user')
 * @Controller('users')
 * export class UserController {
 *   @RequirePermissions(['delete:user'])
 *   @Delete(':id')
 *   remove(@Param('id') id: string) {
 *     // ...
 *   }
 * }
 * ```
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [
        context.getHandler(), // метод
        context.getClass(), // контроллер
      ],
    );



    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // если разрешения не заданы — маршрут общедоступный
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user as UserWithRolesAndPermissions;



    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    // администратор имеет доступ ко всем ресурсам по умолчанию
    if (user.roles.includes('admin')) {
      return true;
    }

    const hasPermission = requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
