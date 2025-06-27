import { INestApplication } from '@nestjs/common';
import { config } from 'dotenv';
import { Api } from '../utils/api';

// Загружаем конфигурацию из .env.test с перезаписью существующих значений
config({ path: '.env.test', override: true });

export const authTestSuit = (app: INestApplication, api: Api) => {
  it('должен корректно обрабатывать запрос /auth/login без options.headers', async () => {
    const response = await api.fetch('/auth/login');
    
    // Проверяем что запрос выполнился (даже если вернул 401, это нормально)
    expect(response).toBeDefined();
    expect(response instanceof Response).toBe(true);
  });

  it('должен успешно войти как admin', async () => {
    const loginResponse = await api.login('admin', 'admin');
    const loginResult = await loginResponse.json();
    expect(loginResponse.status).toBe(200);
    expect(api.cookies.access_token).toBeDefined();
    expect(loginResult).toEqual({message: "Вход выполнен успешно"});
  });

  it('не должен войти с неверными учетными данными', async () => {
    const loginResponse = await api.login('wrong', 'wrong');
    expect(loginResponse.status).toBe(401);
  });

  it('должен успешно выйти', async () => {
    const logoutResponse = await api.fetch('/auth/logout', {
      method: 'POST',
    });
    const logoutResult = await logoutResponse.json();
    expect(logoutResponse.status).toBe(200);
    expect(logoutResult).toEqual({
      message: 'Выход выполнен успешно',
    });
  });
};
