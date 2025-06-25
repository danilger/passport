import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PermissionService } from '../../src/permission/permission.service';
import { RoleService } from '../../src/role/role.service';
import { UserService } from '../../src/user/user.service';

describe('Инициализация системы (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let roleService: RoleService;
  let permissionService: PermissionService;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    roleService = moduleFixture.get<RoleService>(RoleService);
    permissionService = moduleFixture.get<PermissionService>(PermissionService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  describe('Административный пользователь по умолчанию', () => {
    it('должен иметь админа в базе данных', async () => {
      const admin = await userService.findByUsername('admin');
      expect(admin).toBeDefined();
      expect(admin).not.toBeNull();
      if (admin) {
        expect(admin.username).toBe('admin');
      }
    });

    it('должен иметь роль админа', async () => {
      const admin = await userService.findByUsername('admin');
      expect(admin).toBeDefined();
      expect(admin).not.toBeNull();
      if (admin) {
        const roles = admin.roles;
        expect(roles).toBeDefined();
        expect(roles.some(role => role.name === 'admin')).toBe(true);
      }
    });
  });

  describe('Роли по умолчанию', () => {
    it('должна быть роль админа в базе данных', async () => {
      const roles = await roleService.findAll();
      const adminRole = roles.find(role => role.name === 'admin');
      expect(adminRole).toBeDefined();
      if (adminRole) {
        expect(adminRole.name).toBe('admin');
      }
    });
  });

  describe('Разрешения по умолчанию', () => {
    it('должны быть базовые разрешения в базе данных', async () => {
      const permissions = await permissionService.findAll();
      expect(permissions.length).toBeGreaterThan(0);
      
      // Проверяем наличие базовых разрешений
      const expectedPermissions = [
        'can_create:user',
        'can_read:users',
        'can_update:user',
        'can_delete:user',
        'can_manage:user_roles'
      ];

      expectedPermissions.forEach(permission => {
        expect(permissions.some(p => p.name === permission)).toBe(true);
      });
    });

    it('должны быть разрешения назначены роли админа', async () => {
      const roles = await roleService.findAll();
      const adminRole = roles.find(role => role.name === 'admin');
      expect(adminRole).toBeDefined();
      if (adminRole) {
        expect(adminRole.permissions.length).toBeGreaterThan(0);
      }
    });
  });
}); 