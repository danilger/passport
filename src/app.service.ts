import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IRoleRepository, IUserRepository } from './common/interfaces/repository.interface';
import { RoleService } from './role/role.service';
import { UserService } from './user/user.service';
import { ROLE_REPOSITORY } from './role/repositories/typeorm-role.repository';
import { USER_REPOSITORY } from './user/repositories/typeorm-user.repository';
import { PermissionService } from './permission/permission.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY) private roleRepository: IRoleRepository,
    private roleService: RoleService,
    private userService: UserService,
    private permissionService: PermissionService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminExists();
    await this.ensurePermissionsExist();
  }

  private async ensurePermissionsExist() {
    try {
      console.log('Создание базовых разрешений...');
      
      // Разрешения для пользователей
      const userPermissions = [
        'can_create:user',
        'can_read:users',
        'can_read:user',
        'can_update:user',
        'can_delete:user',
        'can_manage:user_roles',
        'can_change:own_password'
      ];

      // Разрешения для ролей
      const rolePermissions = [
        'can_create:role',
        'can_read:roles',
        'can_read:role',
        'can_update:role',
        'can_delete:role',
        'can_manage:role_permissions'
      ];

      // Разрешения для управления разрешениями
      const permissionPermissions = [
        'can_create:permission',
        'can_read:permissions',
        'can_read:permission',
        'can_update:permission',
        'can_delete:permission'
      ];

      // Объединяем все разрешения
      const allPermissions = [
        ...userPermissions,
        ...rolePermissions,
        ...permissionPermissions
      ];

      // Создаем каждое разрешение, если оно еще не существует
      for (const permissionName of allPermissions) {
        const existingPermission = await this.permissionService.findByName(permissionName);
        if (!existingPermission) {
          console.log(`Создание разрешения: ${permissionName}`);
          await this.permissionService.create({
            name: permissionName
          });
        }
      }

      // Назначаем все разрешения роли admin
      const adminRole = await this.roleRepository.findByName('admin');
      if (adminRole) {
        console.log('Назначение всех разрешений роли admin...');
        await this.roleService.setPermissionToRole('admin', allPermissions);
      }

      console.log('Все базовые разрешения успешно созданы и назначены роли admin');
    } catch (error) {
      console.error('Ошибка при создании разрешений:', error.message);
    }
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
