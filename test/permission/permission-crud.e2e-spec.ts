import { config } from 'dotenv';
import { Api } from '../utils/api';

config({ path: '.env.test', override: true });

export const permissionCrudTestSuit = (api: Api) => {
  let permissionId: string;
  const testPermissionName = 'can_test:test';

  it('должен создать новое разрешение', async () => {
    await api.login('admin', 'admin');
    
    const createPermissionResponse = await api.fetch('/permission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testPermissionName,
      }),
    });
  
    expect(createPermissionResponse.status).toBe(201);
    
    const permission = await createPermissionResponse.json();
    expect(permission).toBeDefined();
    expect(permission.name).toBe(testPermissionName);
    permissionId = permission.id;
  });

  it('не должен создать разрешение с некорректными данными', async () => {
    const createPermissionResponse = await api.fetch('/permission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'te', // слишком короткое имя
      }),
    });

    expect(createPermissionResponse.status).toBe(400);
  });

  it('должен получить список всех разрешений', async () => {
    const response = await api.fetch('/permission', {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const permissions = await response.json();
    expect(Array.isArray(permissions)).toBe(true);
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions.some(p => p.name === testPermissionName)).toBe(true);
  });

  it('должен получить разрешение по ID', async () => {
    const response = await api.fetch(`/permission/${permissionId}`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const permission = await response.json();
    expect(permission.id).toBe(permissionId);
    expect(permission.name).toBe(testPermissionName);
  });

  it('должен обновить данные разрешения', async () => {
    const updatedName = 'can_test:updated';
    const response = await api.fetch(`/permission/${permissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updatedName,
      }),
    });

    expect(response.status).toBe(200);
    const permission = await response.json();
    expect(permission.name).toBe(updatedName);
  });

  it('должен удалить разрешение', async () => {
    const response = await api.fetch(`/permission/${permissionId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);

    // Проверяем что разрешение действительно удалено
    const checkResponse = await api.fetch(`/permission/${permissionId}`, {
      method: 'GET',
    });
    expect(checkResponse.status).toBe(404);
  });
}; 