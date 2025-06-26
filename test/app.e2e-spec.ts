import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { authTestSuit } from './auth/auth.e2e-spec';
import { userOperationsTestSuit } from './user/user-operations.e2e-spec';
import { roleCrudTestSuit } from './role/role-crud.e2e-spec';
import { permissionCrudTestSuit } from './permission/permission-crud.e2e-spec';
import { cleanupTestEnvironment } from './utils/cleanup';
import { Api } from './utils/api';
import { config } from 'dotenv';

// Загружаем конфигурацию из .env.test с перезаписью существующих значений
config({ path: '.env.test', override: true });

describe('E2E Тесты', () => {
  let app: INestApplication;
  const api = new Api(
    `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5001}`,
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Глобальные настройки приложения
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        stopAtFirstError: true,
        validationError: {
          target: false,
          value: false,
        },
        transformOptions: {
          enableImplicitConversion: true,
          exposeDefaultValues: true,
        },
        disableErrorMessages: false,
      }),
    );

    await app.init();
    await app.listen(process.env.PORT || 5001);
  });

  afterAll(async () => {
    await app.close();
    // Очищаем окружение только после выполнения всех тестов
    await cleanupTestEnvironment();
  });

  // 1. Базовые тесты приложения
  describe('Контроллер приложения', () => {
    it('GET /api должен вернуть информацию о сервисе', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            name: 'Passport Service',
            description:
              'Сервис управления пользователями, ролями и разрешениями',
            documentation: '/api/docs',
          });
        });
    });
  });

  // 2. Тесты аутентификации
  describe('Аутентификация', () => {
    authTestSuit(app, api);
  });

  // 3. Тесты CRUD операций с ролями
  describe('Роли', () => {
    roleCrudTestSuit(api);
  });
  
  // 4. Тесты CRUD операций с разрешениями
  describe('Разрешения', () => {
    permissionCrudTestSuit(api);
  });

  // 5. Тесты операций с пользователями
  describe('Операции с пользователями', () => {
    userOperationsTestSuit(api);
  });

});
