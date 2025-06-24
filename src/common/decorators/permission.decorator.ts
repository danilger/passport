// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Декоратор для указания требуемых ролей
 * 
 * @description
 * Устанавливает метаданные с требуемыми ролями для endpoint'а или контроллера.
 * Эти метаданные затем используются в RolesGuard для проверки прав доступа.
 * 
 * @param roles Массив строк с названиями требуемых ролей
 * 
 * @important Должен использоваться совместно с @UseGuards(PermissionsGuard)
 * 
 * @usage
 * ```typescript
 * @Permissions('can_view_user','can_update_user')
 * @UseGuards(PermissionsGuard)
 * async protectedEndpoint() {}
 * ```
 */
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
