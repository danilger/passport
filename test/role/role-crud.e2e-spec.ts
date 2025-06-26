import { config } from 'dotenv';
import { Api } from '../utils/api';

config({ path: '.env.test', override: true });

export const roleCrudTestSuit = (api: Api) => {
  let roleId: string;
  const roleName = 'test';

  it('должен создать новую роль '+roleName, async () => {
    await api.login('admin', 'admin');

    const createRoleResponse = await api.fetch('/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: roleName,
      }),
    });



    expect(createRoleResponse.status).toBe(201);
    const role = await createRoleResponse.json();

    expect(role).toBeDefined();
    expect(role.name).toBe(roleName);
    roleId = role.id;
  });

  it('не должен создать роль с некорректными данными', async () => {
    const createRoleResponse = await api.fetch('/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'te', // слишком короткое имя
      }),
    });

    expect(createRoleResponse.status).toBe(400);
  });

  it('должен получить список всех ролей', async () => {
    const response = await api.fetch('/role', {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const roles = await response.json();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.find(role => role.name === roleName)).toBeDefined();
    expect(roles.length).toBeGreaterThan(0);
  });

  it('должен получить роль по ID', async () => {
    const response = await api.fetch(`/role/${roleId}`, {
      method: 'GET',
    });

    expect(response.status).toBe(200);
    const role = await response.json();
    expect(role.id).toBe(roleId);
    expect(role.name).toBe(roleName);
  });

  it('должен обновить данные роли', async () => {
    const response = await api.fetch(`/role/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'test_updated',
      }),
    });

    expect(response.status).toBe(200);
    const role = await response.json();
    expect(role.name).toBe('test_updated');
  });

  it('должен удалить роль '+roleName, async () => {
    const response = await api.fetch(`/role/${roleId}`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);

    // Проверяем что роль действительно удалена
    const checkResponse = await api.fetch(`/role/${roleId}`, {
      method: 'GET',
    });
    expect(checkResponse.status).toBe(404);
  });

  it('должен создать роль user', async () => {
    const createRoleResponse = await api.fetch('/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'user',
      }),
    });

    expect(createRoleResponse.status).toBe(201);
    const role = await createRoleResponse.json();
    expect(role).toBeDefined();
    expect(role.name).toBe('user');
  });

  it('должен предоставить роли user право can_change:own_password', async () => {
    const response = await api.fetch('/role/set-permissions/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleId: 'user',
        permissions: ['can_change:own_password'],
      }),
    });

    expect(response.status).toBe(201);
  });

  
};
