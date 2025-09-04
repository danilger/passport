import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({
    type: String,
    description: 'Сообщение о результате операции',
  })
  message: string;
}
