import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { Api } from 'test/utils/api';
import { AppModule } from '../../src/app.module';

// Загружаем конфигурацию из .env.test с перезаписью существующих значений
config({ path: '.env.test', override: true });

describe('Управление пользователями (e2e)', () => {
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

    // Логинимся как админ для создания пользователя
    const loginResponse = await api.login('admin', 'admin');
    expect(loginResponse.status).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Создание тестового пользователя', () => {
    it('должен создать пользователя user', async () => {
      const createUserResponse = await api.fetch('/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'user',
          password: 'user',
          email: 'user@example.com',
        }),
      });

      expect(createUserResponse.status).toBe(201);
      const user = await createUserResponse.json();
      expect(user).toBeDefined();
      expect(user.username).toBe('user');
      expect(user.email).toBe('user@example.com');
    });
  });

  // describe('Удаление тестового пользователя', () => {
  //   it('должен удалить пользователя user', async () => {
  //     const userListResponse = await api.fetch('/user', {
  //       method: 'GET',
  //     })

  //     const userList = await userListResponse.json();
  //     console.log(JSON.stringify(userList, null, 2));
  //     // const deleteUserResponse = await api.fetch(`/user/${user.id}`, {
  //     //   method: 'DELETE',
  //     // });

  //     // expect(deleteUserResponse.status).toBe(200);
  //   });
  // });
});
