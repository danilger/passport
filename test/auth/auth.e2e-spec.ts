import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { Api } from 'test/utils/api';
import { AppModule } from '../../src/app.module';

// Загружаем конфигурацию из .env.test с перезаписью существующих значений
config({ path: '.env.test', override: true });

describe('Система аутентификации (e2e)', () => {
  let app: INestApplication;
  let api: Api;

  beforeAll(async () => {
    api = new Api(
      `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5001}`,
    );
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    await app.listen(process.env.PORT || 5001);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Процесс аутентификации', () => {
    it('должен выполнить вход под админом', async () => {
      const response = await api.login('admin', 'admin');
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.message).toBe('Вход выполнен успешно');

      // Проверяем, что куки установлены
      expect(api.cookies['access_token']).toBeDefined();
      expect(api.cookies['refresh_token']).toBeDefined();
    });

    it('должен иметь доступ к защищенным маршрутам после входа', async () => {
      // Проверяем наличие базовых ролей
      const rolesResponse = await api.fetch('/role');
      expect(rolesResponse.status).toBe(200);

      const roles = await rolesResponse.json();
      expect(roles).toContainEqual(expect.objectContaining({ name: 'admin' }));

      // Проверяем наличие базовых разрешений
      const permissionsResponse = await api.fetch('/permission');
      expect(permissionsResponse.status).toBe(200);

      const permissions = await permissionsResponse.json();
      expect(permissions).toContainEqual(
        expect.objectContaining({ name: 'can_create:user' }),
      );
      expect(permissions).toContainEqual(
        expect.objectContaining({ name: 'can_read:user' }),
      );
    });
  });
});
