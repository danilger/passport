import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role/entities/role.entity';
import { User } from './user/entities/user.entity';
import { RoleService } from './role/role.service';
import { UserService } from './user/user.service';
import { TypeOrmUserRepository } from './user/repositories/typeorm-user.repository';
import { TypeOrmRoleRepository } from './role/repositories/typeorm-role.repository';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private userRepository: TypeOrmUserRepository,
    private roleRepository: TypeOrmRoleRepository,
    private roleService: RoleService,
    private userService: UserService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminExists();
  }

  private async ensureAdminExists() {
    try {
      console.log('Проверка наличия административной роли...');
      let adminRole = await this.roleRepository.findByName('admin');

      if (!adminRole) {
        console.log('Создание административной роли...');
        adminRole = await this.roleService.create({
          name: 'admin',
        });

        if (!adminRole) {
          throw new Error('Не удалось создать административную роль');
        }
        console.log('Административная роль успешно создана');
      }

      console.log('Проверка наличия административного пользователя...');
      const adminExists = await this.userRepository.findByName('admin');

      if (!adminExists) {
        console.log('Создание административного пользователя...');
        const adminUser = await this.userService.create({
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin',
        });

        if (adminUser) {
          await this.userService.update(adminUser.id, {
            isActive: true,
            isVerified: true,
          });
          console.log(
            'Административный пользователь успешно активирован и верифицирован',
          );

          await this.userService.setRoleToUser(adminUser.id, [adminRole.name]);

          console.log(
            'Административный пользователь успешно назначен роли администратора',
          );
        } else {
          throw new Error('Не удалось создать административного пользователя');
        }
      }
    } catch (error) {
      console.error(
        'Ошибка при инициализации административных данных:',
        error.message,
      );
    }
  }
}
