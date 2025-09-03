import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserListResponse {
  @ApiProperty({ 
    type: [User], 
    description: 'Список пользователей' 
  })
  data: User[];

  @ApiProperty({ 
    example: 100, 
    description: 'Общее количество записей' 
  })
  total: number;

}