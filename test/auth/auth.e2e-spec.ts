import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';

// Загружаем конфигурацию из .env.test
config({ path: '.env.test' });

describe('Authentication System (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let cookies: { [key: string]: string } = {};

  const api = {
    async fetch(endpoint: string, options: RequestInit = {}) {
      const url = `${baseUrl}${endpoint}`;
      if (cookies && Object.keys(cookies).length > 0) {
        console.log('Sending cookies:', cookies);
        if (!options.headers) {
          options.headers = {};
        }
        if (options.headers && typeof options.headers === 'object') {
          (options.headers as Record<string, string>)['cookie'] = `access_token=${cookies.access_token}`;
          console.log('Cookie header:', (options.headers as Record<string, string>)['cookie']);
        }
      }

      const response = await fetch(url, options);
      
      // Сохраняем cookies из ответа
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('Received Set-Cookie:', setCookieHeader);
        const cookieStrings = setCookieHeader.split(',').map(str => str.trim());
        for (const cookieStr of cookieStrings) {
          const [keyValue] = cookieStr.split(';');
          if (keyValue) {
            const [key, value] = keyValue.split('=');
            if (key && value) {
              cookies[key.trim()] = value.trim();
            }
          }
        }
        console.log('Updated cookies:', cookies);
      }

      if (response.status === 401) {
        console.error('Unauthorized:', await response.text());
      }

      return response;
    },

    async login(username: string, password: string) {
      return this.fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
    },
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    await app.listen(process.env.PORT || 5001);
    
    baseUrl = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5001}`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should login as admin', async () => {
      const response = await api.login('admin', 'admin');
      expect(response.status).toBe(200);
      
      const body = await response.json();
      expect(body.message).toBe('Вход выполнен успешно');
      
      // Проверяем, что куки установлены
      expect(cookies['access_token']).toBeDefined();
      expect(cookies['refresh_token']).toBeDefined();
    });

    it('should have access to protected routes after login', async () => {
      // Проверяем наличие базовых ролей
      const rolesResponse = await api.fetch('/role');
      expect(rolesResponse.status).toBe(200);
      
      const roles = await rolesResponse.json();
      expect(roles).toContainEqual(expect.objectContaining({ name: 'admin' }));

      // Проверяем наличие базовых разрешений
      const permissionsResponse = await api.fetch('/permission');
      expect(permissionsResponse.status).toBe(200);
      
      const permissions = await permissionsResponse.json();
      expect(permissions).toContainEqual(expect.objectContaining({ name: 'can_create:user' }));
      expect(permissions).toContainEqual(expect.objectContaining({ name: 'can_read:users' }));
    });
  });
}); 