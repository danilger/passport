import { config } from 'dotenv';
import { Api } from '../utils/api';

config({ path: '.env.test', override: true });

export const userOperationsTestSuit = (api: Api) => {
  let userId: string;

  afterAll(async () => {
    // Удаляем тестового пользователя
    await api.fetch(`/user/${userId}`, {
      method: 'DELETE',
    });
  });

  it('должен создать пользователя', async () => {
    // Логин как админ
    await api.login('admin', 'admin');

    // Создаем тестового пользователя
    const createUserResponse = await api.fetch('/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123',
      }),
    });

    const user = await createUserResponse.json();
    userId = user.id;

    expect(createUserResponse.status).toBe(201);
  });

  it('должен назначить роли пользователю', async () => {
    const response = await api.fetch(`/user/set-roles/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roles: ['user'],
      }),
    });

    console.log(['response', response.status]);

    expect(response.status).toBe(200);

    // Проверяем что роли назначены
    const userResponse = await api.fetch(`/user/${userId}`, {
      method: 'GET',
    });
    const updatedUser = await userResponse.json();
    expect(updatedUser.roles).toBeDefined();
    expect(
      updatedUser.roles.some((role: { name: string }) => role.name === 'user'),
    ).toBe(true);
  });

  it('должен вернуть ошибку при назначении несуществующей роли', async () => {
    const response = await api.fetch(`/user/set-roles/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roles: ['non_existent_role'],
      }),
    });

    expect(response.status).toBe(404);
  });

  it('должен изменить пароль пользователя', async () => {
    await api.login('testuser2', 'password123');
    // Сначала логинимся как тестовый пользователь
    const loginResponse = await api.login('testuser2', 'password123');
    expect(loginResponse.status).toBe(200);

    const response = await api.fetch('/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        previousPassword: 'password123',
        newPassword: 'newpassword123',
      }),
    });

    expect(response.status).toBe(200);

    // Проверяем что можем залогиниться с новым паролем
    const newLoginResponse = await api.login('testuser2', 'newpassword123');
    expect(newLoginResponse.status).toBe(200);
  });

  it('не должен изменить пароль при неверном текущем пароле', async () => {
    const response = await api.fetch('/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        previousPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('должен вернуть информацию о текущем пользователе', async () => {
    // Логинимся как тестовый пользователь
    await api.login('testuser2', 'newpassword123');

    const response = await api.fetch('/user/me', {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const userData = await response.json();

    expect(userData).toHaveProperty('id');
    expect(userData).toHaveProperty('username', 'testuser2');
    expect(userData).toHaveProperty('roles');
    expect(Array.isArray(userData.roles)).toBe(true);
  });

  it('не должен вернуть информацию без авторизации', async () => {
    // Делаем запрос без авторизации
    api.cookies = {}; // Сначала очищаем куки с access_token

    const response = await api.fetch('/user/me', {
      method: 'GET',
    });

    expect(response.status).toBe(401); // Unauthorized
  });
};
