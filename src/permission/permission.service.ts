import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IPermissionRepository } from 'src/common/interfaces/repository.interface';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PERMISSION_REPOSITORY } from './repositories/typeorm-permission.repository';
import { queryDto } from 'src/common/dto/query.dto';
import { makeParams } from 'src/common/adapters/makeParams';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const { name } = createPermissionDto;

      const existingPermission =
        await this.permissionRepository.findByName(name);
      if (existingPermission) {
        throw new BadRequestException(
          'Разрешение с таким именем уже существует',
        );
      }

      return this.permissionRepository.create({ name });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при создании разрешения');
    }
  }

  async findAll(query: queryDto) {
    const { skip, take, search} = makeParams(query);
    const data = await this.permissionRepository.findAll({ skip, take, search });
    const total = await this.permissionRepository.count(search);
    try {
      return { data, total };
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

  async findByName(name: string) {
    try {
      const permission = await this.permissionRepository.findByName(name);
      if (!permission) {
        return null;
      }
      return permission;
    } catch (error) {
      throw new BadRequestException('Ошибка при поиске разрешения по имени');
    }
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    try {
      const { name } = updatePermissionDto;
      await this.findOne(id);

      if (name) {
        const existingPermission =
          await this.permissionRepository.findByName(name);
        if (existingPermission && existingPermission.id !== id) {
          throw new BadRequestException(
            'Разрешение с таким именем уже существует',
          );
        }
      }

      return this.permissionRepository.update(id, updatePermissionDto);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении разрешения');
    }
  }

  async remove(id: string) {
    try {
      // Получаем разрешение со связями
      const permissionWithRoles = await this.permissionRepository.findById(id);

      if (!permissionWithRoles) {
        throw new NotFoundException(`Разрешение с ID "${id}" не найдено`);
      }

      if (permissionWithRoles.roles?.length > 0) {
        await this.permissionRepository.save({
          ...permissionWithRoles,
          roles: [],
        });
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
