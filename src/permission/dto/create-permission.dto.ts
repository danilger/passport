import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Название разрешения',
    example: 'can_read:users',
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
