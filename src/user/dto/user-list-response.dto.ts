import { ApiProperty } from '@nestjs/swagger';
import { UserWithoutRoles } from './user-response.dto';

export class UserListResponse {
  @ApiProperty({
    type: [UserWithoutRoles],
    description: 'Список пользователей',
  })
  data: UserWithoutRoles[];

  @ApiProperty({
    example: 100,
    description: 'Общее количество записей',
  })
  total: number;
}
