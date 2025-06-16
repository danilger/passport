import { Role } from '../../role/entities/role.entity'; // путь должен быть относительным иначе возникает ошибка при создании миграции
import { Entity, Column, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
