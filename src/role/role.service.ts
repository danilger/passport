import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TypeOrmRoleRepository } from './repositories/typeorm-role.repository';
import { TypeOrmPermissionRepository } from 'src/permission/repositories/typeorm-permission.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: TypeOrmRoleRepository,
    private readonly permissionRepository: TypeOrmPermissionRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name } = createRoleDto;

    const existingRole = await this.roleRepository.findByName(name);
    if (existingRole) {
      throw new Error('Роль с таким именем уже существует');
    }

    return this.roleRepository.create({ name });
  }

  async findAll() {
    return this.roleRepository.findAll();
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Роль с ID "${id}" не найдена`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { name } = updateRoleDto;
    await this.findOne(id);

    if (name) {
      const existingRole = await this.roleRepository.findByName(name);
      if (existingRole && existingRole.id !== id) {
        throw new Error('Роль с таким именем уже существует');
      }
    }

    return this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.roleRepository.delete(id);
  }

  async setPermissionToRole(roleName: string, permissions: string[]) {
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new NotFoundException(`Роль с именем "${roleName}" не найдена`);
    }

    const permissionsArray = await this.permissionRepository.findByNames(permissions);
    if (!permissionsArray) {
      throw new NotFoundException(`Разрешения с именами "${permissions}" не найдены`);
    }

    // Инициализируем массив разрешений, если он не существует
    if (!role.permissions) {
      role.permissions = [];
    }

    // Обновляем список разрешений
    role.permissions = [...role.permissions, ...permissionsArray];
    
    // Убираем дубликаты по id
    role.permissions = role.permissions.filter((permission, index, self) =>
      index === self.findIndex((p) => p.id === permission.id)
    );

    return this.roleRepository.save(role);
  }
}
