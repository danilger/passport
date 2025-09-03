import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class queryDto {
  @ApiProperty({
    description: 'страница',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'отображаемых записей на странице',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  perPage?: string;

  @ApiProperty({
    description: 'поле для сортировки',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({
    description: 'порядок сортировки ASC/DESC',
    required: false,
    type: 'string',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum({ ASC: 'ASC', DESC: 'DESC' })
  order?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'поиск',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'фильтры (объект в виде JSON-строки)',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return {};
    }
  })
  filters?: Record<string, string>;
}
