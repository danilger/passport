import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Название роли',
    example: 'admin',
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
