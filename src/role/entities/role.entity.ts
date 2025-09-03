import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Уникальный идентификатор роли' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Название роли (уникальное)' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Пользователи с данной ролью',
    type: () => User,
    isArray: true,
  })
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ApiProperty({
    description: 'Разрешения, связанные с данной ролью',
    type: () => Permission,
    isArray: true,
  })
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
