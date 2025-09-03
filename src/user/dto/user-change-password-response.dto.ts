import { ApiProperty } from "@nestjs/swagger";

export class UserChangePasswordResponseDto {
    @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Пароль успешно изменен',
    type: String,
  })
  message: string;
}
