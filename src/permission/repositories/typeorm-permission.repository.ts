import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IPermissionRepository } from '../../common/interfaces/repository.interface';
import { Permission } from '../entities/permission.entity';
// import { Permission } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

@Injectable()
export class TypeOrmPermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      relations: ['roles'],
    });
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(data);
    return this.permissionRepository.save(permission);
  }

  async update(id: string, data: Partial<Permission>): Promise<Permission | null> {
    await this.permissionRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.permissionRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { name },
      relations: ['roles'],
    });
  }

  async findByNames(name: string[]): Promise<Permission[] | null> {
    return this.permissionRepository.find({
      where: { name: In(name) },
    });
  }

  async save(permission: Permission): Promise<Permission> {
    // Сначала получаем существующую роль со всеми отношениями
    const existingPermission = await this.permissionRepository.findOne({
      where: { id: permission.id },
      relations: ['role']
    });

    if (!existingPermission) {
      throw new Error('Разрешение не найдена');
    }

    // Обновляем только отношения
    existingPermission.roles = permission.roles;
   
    return this.permissionRepository.save(existingPermission);
  }
} 