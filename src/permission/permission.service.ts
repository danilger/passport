import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TypeOrmPermissionRepository } from './repositories/typeorm-permission.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: TypeOrmPermissionRepository,
    @InjectRepository(Permission)
    private readonly permissionTypeormRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const { name } = createPermissionDto;

      const existingPermission = await this.permissionRepository.findByName(name);
      if (existingPermission) {
        throw new BadRequestException('Разрешение с таким именем уже существует');
      }

      return this.permissionRepository.create({ name });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при создании разрешения');
    }
  }

  async findAll() {
    try {
      return this.permissionRepository.findAll();
    } catch (error) {
      throw new BadRequestException('Ошибка при получении списка разрешений');
    }
  }

  async findOne(id: string) {
    try {
      const permission = await this.permissionRepository.findById(id);
      if (!permission) {
        throw new NotFoundException(`Разрешение с ID "${id}" не найдено`);
      }
      return permission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при поиске разрешения');
    }
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    try {
      const { name } = updatePermissionDto;
      await this.findOne(id);

      if (name) {
        const existingPermission = await this.permissionRepository.findByName(name);
        if (existingPermission && existingPermission.id !== id) {
          throw new BadRequestException('Разрешение с таким именем уже существует');
        }
      }

      return this.permissionRepository.update(id, updatePermissionDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении разрешения');
    }
  }

  async remove(id: string) {
    try {     
      // Получаем разрешение со связями
      const permissionWithRoles = await this.permissionTypeormRepository.findOne({
        where: { id },
        relations: ['roles']
      });

      if (permissionWithRoles && permissionWithRoles.roles) {
        // Очищаем связи с ролями
        permissionWithRoles.roles = [];
        await this.permissionTypeormRepository.save(permissionWithRoles);
      }

      // Теперь можно безопасно удалить разрешение
      return this.permissionRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при удалении разрешения');
    }
  }
}
