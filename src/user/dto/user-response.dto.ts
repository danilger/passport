import { ApiProperty, OmitType } from '@nestjs/swagger';
import { RoleResponse } from 'src/role/dto/role-response.dto';
import { User } from '../entities/user.entity';

// Исключаем поле roles из User, чтобы потом переопределить его
export class UserWithoutRoles extends OmitType(User, ['roles'] as const) {}

export class UserResponse extends UserWithoutRoles {
  @ApiProperty({
    type: [RoleResponse],
    description: 'Роли пользователя',
    example: [
      {
        name: 'admin',
      },
    ],
  })
  roles: RoleResponse[];
}
