import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../role/entities/role.entity'; // путь должен быть относительным иначе возникает ошибка при создании миграции

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({type:'string'})
  id: string;

  @Column({ unique: true })
  @ApiProperty({type:'string'})
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  @ApiProperty({
    description: 'Роли, связанные с данным разрешением',
    type: () => Role,
    isArray: true,
  })
  roles: Role[];
}
