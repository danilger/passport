import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class queryDto {

  @ApiProperty({
    description: 'страница',
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'отображаемых записей на странице',
    required: false,
  })
  @IsOptional()
  @IsString()
  perPage?: string;

  @ApiProperty({
    description: 'поле для сортировки',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({
    description: 'порядок сортировки ASC/DESC',
    required: false,
    type: String,
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum({ ASC: 'ASC', DESC: 'DESC' })
  order?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'поиск',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;
}
