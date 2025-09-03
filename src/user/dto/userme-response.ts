import { ApiProperty } from "@nestjs/swagger";

export class UserMeResponse {
    @ApiProperty({ description: 'ID пользователя' })
    id: string;
  
    @ApiProperty({ description: 'Имя пользователя' })
    username: string;
  
    @ApiProperty({ description: 'Роли пользователя' })
    roles: string[];
  }