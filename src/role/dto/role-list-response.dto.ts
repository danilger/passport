import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Permission } from 'src/permission/entities/permission.entity';
import { UserWithoutRoles } from 'src/user/dto/user-response.dto';

class PermissionWithoutRoles extends OmitType(Permission, ['roles'] as const) {}

export class RoleWithUsersAndPermissions {
  @ApiProperty({ example: '1', description: 'ID роли' })
  id: string;
  @ApiProperty({ example: 'admin', description: 'Название роли' })
  name: string;
  @ApiProperty({
    description: 'Список пользователей с этой ролью',
    type: [UserWithoutRoles],
  })
  users: UserWithoutRoles[];
  @ApiProperty({ type: [PermissionWithoutRoles] })
  permissions: PermissionWithoutRoles[];
}

export class RoleListResponse {
  @ApiProperty({
    description: 'Список ролей',
    type: [RoleWithUsersAndPermissions],
  })
  data: RoleWithUsersAndPermissions[];
  @ApiProperty({ example: 10, description: 'Общее количество записей' })
  total: number;
}
