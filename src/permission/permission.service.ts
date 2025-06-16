import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TypeOrmPermissionRepository } from './repositories/typeorm-permission.repository';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: TypeOrmPermissionRepository,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const { name } = createPermissionDto;

    const existingPermission = await this.permissionRepository.findByName(name);
    if (existingPermission) {
      throw new Error('Разрешение с таким именем уже существует');
    }

    return this.permissionRepository.create({ name });
  }

  async findAll() {
    return this.permissionRepository.findAll();
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Разрешение с ID "${id}" не найдено`);
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const { name } = updatePermissionDto;
    await this.findOne(id);

    if (name) {
      const existingPermission = await this.permissionRepository.findByName(name);
      if (existingPermission && existingPermission.id !== id) {
        throw new Error('Разрешение с таким именем уже существует');
      }
    }

    return this.permissionRepository.update(id, updatePermissionDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.permissionRepository.delete(id);
  }
}
