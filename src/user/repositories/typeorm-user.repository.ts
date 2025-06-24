import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IUserRepository
} from '../../common/interfaces/repository.interface';
import { Permission } from '../../permission/entities/permission.entity';
import { Role } from '../../role/entities/role.entity';
import { User } from '../entities/user.entity';

// Расширенный тип User с загруженными связями
type UserWithRelations = User & {
  roles?: (Role & {
    permissions?: Permission[];
  })[];
};

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

@Injectable()
export class TypeOrmUserRepository
  implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: {
        roles: {
          name: true,
        },
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByName(username: string): Promise<UserWithRelations | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async save(user: User): Promise<User> {
    // Сначала получаем существующего пользователя со всеми отношениями
    const existingUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roles'],
    });

    if (!existingUser) {
      throw new Error('Пользователь не найден');
    }

    // Обновляем только отношения
    existingUser.roles = user.roles;

    return this.userRepository.save(existingUser);
  }
}
