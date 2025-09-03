import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Role } from '../../role/entities/role.entity';

// Исключаем поле roles из User, чтобы потом переопределить его
class UserWithoutRoles extends OmitType(User, ['roles'] as const) {}

// Выбираем только нужные поля из роли
class RoleBasic extends PickType(Role, ['id', 'name'] as const) {}

export class UserResponse extends UserWithoutRoles {
  @ApiProperty({ 
    type: [RoleBasic], 
    description: 'Роли пользователя',
    example: [
      {
        id: '35a41a41-0d6b-4319-a48a-b2f01a83451e',
        name: 'admin'
      }
    ]
  })
  roles: RoleBasic[];
}