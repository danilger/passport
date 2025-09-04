import { PickType } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';

// Выбираем только нужные поля из роли
export class RoleResponse extends PickType(Role, ['name'] as const) {}
export class RoleResponseWithId extends PickType(Role, ['id', 'name'] as const) {}