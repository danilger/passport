import { ApiProperty } from '@nestjs/swagger';

class UserData {
  @ApiProperty({
    description: 'Имя пользователя',
    type: String,
  })
  username: string;
  @ApiProperty({
    description: 'Роли пользователя',
    type: [String],
  })
  roles: string[];
  @ApiProperty({
    description: 'Разрешения пользователя',
    type: [String],
  })
  permissions: string[];
}

export class CheckAuthResponseDto {
  @ApiProperty({
    description: 'Сообщение о результате операции',
    type: String,
  })
  message: string;
  @ApiProperty({
    description: 'Пользователь',
    type: UserData,
  })
  user: {
    username: string;
    roles: string[];
    permissions: string[];
  };
}

