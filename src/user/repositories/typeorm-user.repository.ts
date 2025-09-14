import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  IUserRepository,
  QueryParams,
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
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string, options?: { cache?: { id: string; milliseconds: number } }): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
        select: {
          roles: {
            name: true,
          },
        },
        cache: options?.cache,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll({ skip, take, search }: QueryParams): Promise<User[]> {
    try {
      const where = search
        ? [
            { username: ILike(`%${search}%`) },
            { email: ILike(`%${search}%`) },
            { fullName: ILike(`%${search}%`) },
            { phoneNumber: ILike(`%${search}%`) },
            { authProvider: ILike(`%${search}%`) },
            { locale: ILike(`%${search}%`) },
            { timezone: ILike(`%${search}%`) },
            { avatarUrl: ILike(`%${search}%`) },
          ]
        : {};
      return await this.userRepository.find({ skip, take, where });
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(data: Partial<User>): Promise<User> {
    try {
      const user = this.userRepository.create(data);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      await this.userRepository.update(id, data);
      return await this.findById(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByName(username: string): Promise<UserWithRelations | null> {
    try {
      return await this.userRepository.findOne({
        where: { username },
        relations: ['roles', 'roles.permissions'],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async save(user: User): Promise<User> {
    try {
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

      return await this.userRepository.save(existingUser);
    } catch (error) {
      throw new Error(error);
    }
  }

  async count(search?: string) {
    try {
      const where = search
        ? [
            { username: ILike(`%${search}%`) },
            { email: ILike(`%${search}%`) },
            { fullName: ILike(`%${search}%`) },
            { phoneNumber: ILike(`%${search}%`) },
            { authProvider: ILike(`%${search}%`) },
            { locale: ILike(`%${search}%`) },
            { timezone: ILike(`%${search}%`) },
            { avatarUrl: ILike(`%${search}%`) },
          ]
        : {};
      const count = await this.userRepository.count({ where });
      return count;
    } catch (error) {
      throw new Error(error);
    }
  }
}
