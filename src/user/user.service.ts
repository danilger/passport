import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';
import { User } from './entities/user.entity';
import { TypeOrmRoleRepository } from 'src/role/repositories/typeorm-role.repository';

@Injectable()
export class UserService {
  constructor(
    private repository: TypeOrmUserRepository,
    private readonly roleRepository: TypeOrmRoleRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return this.repository.create(createUserDto);
    } catch (error) {
      throw new BadRequestException('Ошибка при создании пользователя');
    }
  }

  async findAll() {
    try {
      return await this.repository.findAll();
    } catch (error) {
      throw new BadRequestException(
        'Ошибка при получении списка пользователей',
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при поиске пользователя');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return this.repository.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return this.repository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при удалении пользователя');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return this.repository.findByName(username);
    } catch (error) {
      throw new BadRequestException('Ошибка при поиске пользователя по имени');
    }
  }

  async setRoleToUser(id: string, roles: string[]) {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw new NotFoundException(`Пользователь с ID "${id}" не найден`);
      }

      const rolesArray = await this.roleRepository.findByNames(roles);
      if (!rolesArray) {
        throw new NotFoundException(`Роли с именами "${roles}" не найдены`);
      }

      // Инициализируем массив ролей, если он не существует
      if (!user.roles) {
        user.roles = [];
      }

      // Обновляем список ролей
      user.roles = [...user.roles, ...rolesArray];

      // Убираем дубликаты по id
      user.roles = user.roles.filter(
        (role, index, self) =>
          index === self.findIndex((r) => r.id === role.id),
      );

      return this.repository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при назначении ролей пользователю');
    }
  }
}
