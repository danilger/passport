import { ApiProperty, PickType } from '@nestjs/swagger';
import { RoleResponseWithId } from 'src/role/dto/role-response.dto';
import { Permission } from '../entities/permission.entity';

export class PermissionResponse extends PickType(Permission, ['id', 'name'] as const) {
    @ApiProperty({
        type: [RoleResponseWithId],
        description: 'Роли, связанные с этим разрешением',
    })
    roles: RoleResponseWithId[];
}

