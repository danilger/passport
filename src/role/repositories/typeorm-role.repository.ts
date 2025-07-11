import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, ILike } from 'typeorm';
import { IRoleRepository, QueryParams } from '../../common/interfaces/repository.interface';
import { Role } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

@Injectable()
export class TypeOrmRoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    try {
      return await this.roleRepository.findOne({
        where: { id },
        relations: ['users', 'permissions'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll({skip, take, search}: QueryParams): Promise<Role[]> {
    try {
      const where = search
        ? [
            { name: ILike(`%${search}%`) },
          ]
        : {};
      return await this.roleRepository.find({
        where,
        skip,
        take,
        relations: ['users', 'permissions'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(data: Partial<Role>): Promise<Role> {
    try {
      const role = this.roleRepository.create(data);
      return await this.roleRepository.save(role);
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, data: Partial<Role>): Promise<Role | null> {
    try {
      await this.roleRepository.update(id, data);
      return await this.findById(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.roleRepository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      return await this.roleRepository.findOne({
        where: { name },
        relations: ['users', 'permissions'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async save(role: Role): Promise<Role> {
    try {
      // Сначала получаем существующую роль со всеми отношениями
      const existingRole = await this.roleRepository.findOne({
        where: { id: role.id },
        relations: ['permissions', 'users'],
      });

      if (!existingRole) {
        throw new Error('Роль не найдена');
      }

      // Обновляем только отношения
      existingRole.permissions = role.permissions;
      existingRole.users = role.users;

      return await this.roleRepository.save(existingRole);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByNames(names: string[]): Promise<Role[] | null> {
    try {
      const roles = await this.roleRepository.find({
        where: { name: In(names) },
        relations: ['users', 'permissions'],
      });
      return roles.length > 0 ? roles : null;
    } catch (error) {
      throw new Error(error);
    }
  }

  async count(search?: string) {
    try {
      const where = search
        ? [
            { name: ILike(`%${search}%`) },
          ]
        : {};
      const total = await this.roleRepository.count({ where });
      return total;
    } catch (error) {
      throw new Error(error);
    }
  }
}
