import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponse } from './permission-response.dto';

export class PermissionListResponse {
  @ApiProperty({
    description: 'Список разрешений',
    type: [PermissionResponse],
  })
  data: PermissionResponse[];
  @ApiProperty({
    description: 'Общее количество записей',
    type: Number,
  })
  total: number;
}
