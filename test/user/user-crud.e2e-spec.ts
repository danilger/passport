import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { Api } from 'test/utils/api';
import { cleanupTestEnvironment } from 'test/utils/cleanup';
import { AppModule } from '../../src/app.module';

config({ path: '.env.test', override: true });

describe('User CRUD Operations (e2e)', () => {
  let app: INestApplication;
  let api: Api;
  let userId: string;

  beforeAll(async () => {
    api = new Api(
      `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5001}`,
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    // Добавляем глобальную валидацию
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

    // Логин как админ
    const loginResponse = await api.login('admin', 'admin');
    expect(loginResponse.status).toBe(200);
  });

  afterAll(async () => {
    await app.close();
    await cleanupTestEnvironment();
  });

  describe('POST /user', () => {
    it('должен создать нового пользователя', async () => {
      const createUserResponse = await api.fetch('/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
        }),
      });

      expect(createUserResponse.status).toBe(201);
      const user = await createUserResponse.json();
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('testuser@example.com');
      userId = user.id;
    });

    it('не должен создать пользователя с некорректными данными', async () => {
      const createUserResponse = await api.fetch('/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'te', // слишком короткое имя
          email: 'invalid-email',
          password: '12345', // слишком короткий пароль
        }),
      });

      expect(createUserResponse.status).toBe(400);
    });
  });

  describe('GET /user', () => {
    it('должен получить список всех пользователей', async () => {
      const response = await api.fetch('/user', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const users = await response.json();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('GET /user/:id', () => {
    it('должен получить пользователя по ID', async () => {
      const response = await api.fetch(`/user/${userId}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const user = await response.json();
      expect(user.id).toBe(userId);
      expect(user.username).toBe('testuser');
    });

    it('должен вернуть 404 для несуществующего ID', async () => {
      const response = await api.fetch(
        '/user/99999999-9999-9999-9999-999999999999',
        {
          method: 'GET',
        },
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /user/:id', () => {
    it('должен обновить данные пользователя', async () => {
      const response = await api.fetch(`/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: false,
          isVerified: true,
        }),
      });

      expect(response.status).toBe(200);
      const user = await response.json();
      expect(user.isActive).toBe(false);
      expect(user.isVerified).toBe(true);
    });
  });

  describe('DELETE /user/:id', () => {
    it('должен удалить пользователя', async () => {
      const response = await api.fetch(`/user/${userId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(200);

      // Проверяем что пользователь действительно удален
      const checkResponse = await api.fetch(`/user/${userId}`, {
        method: 'GET',
      });
      expect(checkResponse.status).toBe(404);
    });
  });
});
