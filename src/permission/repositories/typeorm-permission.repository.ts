import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, ILike } from 'typeorm';
import {
  IPermissionRepository,
  QueryParams,
} from '../../common/interfaces/repository.interface';
import { Permission } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

@Injectable()
export class TypeOrmPermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll({ skip, take, search }: QueryParams): Promise<Permission[]> {
    try {
      const where = search
        ? [
            { name: ILike(`%${search}%`) },
          ]
        : {};
      return await this.permissionRepository.find({
        where,
        skip,
        take,
        relations: ['roles'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findById(id: string): Promise<Permission | null> {
    try {
      return await this.permissionRepository.findOne({
        where: { id },
        relations: ['roles'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    try {
      const permission = this.permissionRepository.create(data);
      return await this.permissionRepository.save(permission);
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(
    id: string,
    data: Partial<Permission>,
  ): Promise<Permission | null> {
    try {
      await this.permissionRepository.update(id, data);
      return await this.findById(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.permissionRepository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByName(name: string): Promise<Permission | null> {
    try {
      return await this.permissionRepository.findOne({
        where: { name },
        relations: ['roles'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByNames(name: string[]): Promise<Permission[] | null> {
    try {
      return await this.permissionRepository.find({
        where: { name: In(name) },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async save(permission: Permission): Promise<Permission> {
    try {
      // Сначала получаем существующую роль со всеми отношениями
      const existingPermission = await this.permissionRepository.findOne({
        where: { id: permission.id },
        relations: ['role'],
      });

      if (!existingPermission) {
        throw new Error('Разрешение не найдена');
      }

      // Обновляем только отношения
      existingPermission.roles = permission.roles;

      return await this.permissionRepository.save(existingPermission);
    } catch (error) {
      throw new Error(error);
    }
  }

  async count(search: string) {
    try {
      const where = search
        ? [
            { name: ILike(`%${search}%`) },
          ]
        : {};
      return await this.permissionRepository.count({ where });
    } catch (error) {
      throw new Error(error);
    }
  }
}
