import { Injectable, NotFoundException } from '@nestjs/common';
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

  create(createUserDto: CreateUserDto) {
    return this.repository.create(createUserDto);
  }

  findAll() {
    return this.repository.findAll();
  }

  findOne(id: string) {
    return this.repository.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.repository.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.repository.delete(id);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repository.findByName(username);
  }

  async setRoleToUser(id: string, roles: string[]) {
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
    user.roles = user.roles.filter((role, index, self) =>
      index === self.findIndex((r) => r.id === role.id)
    );

    return this.repository.save(user);
  }
}
