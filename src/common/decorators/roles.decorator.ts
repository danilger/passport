// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Декоратор для указания требуемых ролей
 * 
 * @description
 * Устанавливает метаданные с требуемыми ролями для endpoint'а или контроллера.
 * Эти метаданные затем используются в RolesGuard для проверки прав доступа.
 * 
 * @param roles Массив строк с названиями требуемых ролей
 * 
 * @important Должен использоваться совместно с @UseGuards(RolesGuard)
 * 
 * @usage
 * ```typescript
 * @Roles('admin', 'moderator')
 * @UseGuards(RolesGuard)
 * async protectedEndpoint() {}
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
