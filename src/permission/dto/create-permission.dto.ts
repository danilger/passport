import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Название разрешения',
    example: 'can_read',
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
