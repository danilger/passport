import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IFindByName,
  IRepository,
  ISave,
} from '../../common/interfaces/repository.interface';
import { User } from '../entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';

// Расширенный тип User с загруженными связями
type UserWithRelations = User & {
  roles?: (Role & {
    permissions?: Permission[];
  })[];
};

@Injectable()
export class TypeOrmUserRepository
  implements IRepository<UserWithRelations>, IFindByName<UserWithRelations>, ISave<User>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null > {
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
      relations: ['roles']
    });

    if (!existingUser) {
      throw new Error('Пользователь не найден');
    }

    // Обновляем только отношения
    existingUser.roles = user.roles;

    return this.userRepository.save(existingUser);
  }
}
