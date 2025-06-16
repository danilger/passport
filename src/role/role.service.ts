import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    try {
      const { name } = createRoleDto;

      const existingRole = await this.roleRepository.findByName(name);
      if (existingRole) {
        throw new BadRequestException('Роль с таким именем уже существует');
      }

      return this.roleRepository.create({ name });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при создании роли');
    }
  }

  async findAll() {
    try {
      return this.roleRepository.findAll();
    } catch (error) {
      throw new BadRequestException('Ошибка при получении списка ролей');
    }
  }

  async findOne(id: string) {
    try {
      const role = await this.roleRepository.findById(id);
      if (!role) {
        throw new NotFoundException(`Роль с ID "${id}" не найдена`);
      }
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при поиске роли');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const { name } = updateRoleDto;
      await this.findOne(id);

      if (name) {
        const existingRole = await this.roleRepository.findByName(name);
        if (existingRole && existingRole.id !== id) {
          throw new BadRequestException('Роль с таким именем уже существует');
        }
      }

      return this.roleRepository.update(id, updateRoleDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении роли');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return this.roleRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при удалении роли');
    }
  }

  async setPermissionToRole(roleName: string, permissions: string[]) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при назначении разрешений роли');
    }
  }
}
