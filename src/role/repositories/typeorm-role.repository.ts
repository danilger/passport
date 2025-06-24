import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  IRoleRepository
} from '../../common/interfaces/repository.interface';
import { Role } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

@Injectable()
export class TypeOrmRoleRepository
  implements IRoleRepository
{
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['users', 'permissions'],
    });
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['users', 'permissions'],
    });
  }

  async create(data: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }

  async update(id: string, data: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['users', 'permissions'],
    });
  }

  async save(role: Role): Promise<Role> {
    // Сначала получаем существующую роль со всеми отношениями
    const existingRole = await this.roleRepository.findOne({
      where: { id: role.id },
      relations: ['permissions', 'users']
    });

    if (!existingRole) {
      throw new Error('Роль не найдена');
    }

    // Обновляем только отношения
    existingRole.permissions = role.permissions;
    existingRole.users = role.users;

    return this.roleRepository.save(existingRole);
  }

  async findByNames(names: string[]): Promise<Role[] | null> {
    const roles = await this.roleRepository.find({
      where: { name: In(names) },
      relations: ['users', 'permissions'],
    });
    return roles.length > 0 ? roles : null;
  }
}
