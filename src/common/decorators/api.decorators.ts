import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from './permission.decorator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';
import { UserResponse, UserWithoutRoles } from 'src/user/dto/user-response.dto';
import { UserListResponse } from 'src/user/dto/user-list-response.dto';
import { UserMeResponse } from 'src/user/dto/userme-response';
import { UserChangePasswordResponseDto } from 'src/user/dto/user-change-password-response.dto';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { UpdateRoleDto } from 'src/role/dto/update-role.dto';
import { RoleResponseWithId } from 'src/role/dto/role-response.dto';
import { RoleListResponse, RoleWithUsersAndPermissions } from 'src/role/dto/role-list-response.dto';
import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/permission/dto/update-permission.dto';
import { PermissionResponse } from 'src/permission/dto/permission-response.dto';
import { PermissionListResponse } from 'src/permission/dto/permission-list-response.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponse } from 'src/auth/dto/login-response.dto';
import { CheckAuthResponseDto } from 'src/auth/dto/check-auth-response.dto';

// Базовые декораторы

/**
 * Базовый декоратор аутентификации для Swagger UI
 * @description Добавляет информацию о том, что эндпоинт требует аутентификации через cookies
 * @decorators ApiCookieAuth
 */
export const ApiAuth = () => applyDecorators(ApiCookieAuth());

/**
 * Декоратор аутентификации с проверкой прав доступа
 * @description Добавляет аутентификацию через JWT и опциональную проверку разрешений
 * @decorators ApiCookieAuth, UseGuards(JwtAuthGuard)
 * @guards JwtAuthGuard, PermissionGuard (если указано разрешение)
 * @param permission - название разрешения для проверки (опционально)
 */
export const ApiAuthWithGuards = (permission?: string) => {
  const decorators = [
    ApiCookieAuth(), // декоратор добавляет информацию о безопасности в Swagger
    UseGuards(JwtAuthGuard),
  ];

  if (permission) {
    decorators.push(Permissions(permission), UseGuards(PermissionGuard));
  }

  return applyDecorators(...decorators);
};

// Декораторы для CRUD операций

/**
 * Универсальный декоратор для создания записи
 * @description Добавляет документацию для POST эндпоинта создания записи
 * @decorators ApiOperation, ApiBody, ApiResponse (201, 400)
 * @param summary - краткое описание операции
 * @param bodyType - тип DTO для тела запроса
 * @param responseType - тип DTO для ответа
 */
export const ApiCreate = (summary: string, bodyType: any, responseType: any) =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiBody({ type: bodyType }),
    ApiResponse({
      status: 201,
      description: 'Запись успешно создана',
      type: responseType,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
  );

/**
 * Универсальный декоратор для получения списка записей
 * @description Добавляет документацию для GET эндпоинта получения списка
 * @decorators ApiOperation, ApiResponse (200, 403)
 * @param summary - краткое описание операции
 * @param responseType - тип DTO для ответа
 */
export const ApiRead = (summary: string, responseType: any) =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiResponse({
      status: 200,
      description: 'Данные успешно получены',
      type: responseType,
    }),
    ApiResponse({ status: 403, description: 'Нет доступа' }),
  );

/**
 * Универсальный декоратор для получения одной записи по ID
 * @description Добавляет документацию для GET эндпоинта получения записи по ID
 * @decorators ApiOperation, ApiParam, ApiResponse (200, 404)
 * @param summary - краткое описание операции
 * @param responseType - тип DTO для ответа
 */
export const ApiReadOne = (summary: string, responseType: any) =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiParam({ name: 'id', description: 'ID записи' }),
    ApiResponse({
      status: 200,
      description: 'Запись успешно найдена',
      type: responseType,
    }),
    ApiResponse({ status: 404, description: 'Запись не найдена' }),
  );

/**
 * Универсальный декоратор для обновления записи
 * @description Добавляет документацию для PATCH эндпоинта обновления записи
 * @decorators ApiOperation, ApiParam, ApiBody, ApiResponse (200, 404)
 * @param summary - краткое описание операции
 * @param bodyType - тип DTO для тела запроса
 * @param responseType - тип DTO для ответа
 */
export const ApiUpdate = (summary: string, bodyType: any, responseType: any) =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiParam({ name: 'id', description: 'ID записи' }),
    ApiBody({ type: bodyType }),
    ApiResponse({
      status: 200,
      description: 'Запись успешно обновлена',
      type: responseType,
    }),
    ApiResponse({ status: 404, description: 'Запись не найдена' }),
  );

/**
 * Универсальный декоратор для удаления записи
 * @description Добавляет документацию для DELETE эндпоинта удаления записи
 * @decorators ApiOperation, ApiParam, ApiResponse (200, 404)
 * @param summary - краткое описание операции
 * @param responseType - тип DTO для ответа (по умолчанию 'string')
 */
export const ApiDelete = (summary: string, responseType: any = 'string') =>
  applyDecorators(
    ApiOperation({ summary }),
    ApiParam({ name: 'id', description: 'ID записи' }),
    ApiResponse({
      status: 200,
      description: 'Запись успешно удалена',
      type: responseType,
    }),
    ApiResponse({ status: 404, description: 'Запись не найдена' }),
  );

// Специфичные декораторы для пользователей

/**
 * Декоратор для создания пользователя
 * @description Добавляет полную документацию для POST /user эндпоинта
 * @decorators ApiOperation, ApiBody, ApiResponse (201, 400), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_create:user
 */
export const ApiCreateUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Создание нового пользователя' }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно создан',
      type: UserWithoutRoles,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiAuthWithGuards('can_create:user'),
  );

/**
 * Декоратор для получения списка пользователей
 * @description Добавляет полную документацию для GET /user эндпоинта
 * @decorators ApiOperation, ApiResponse (200, 403), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_read:users
 */
export const ApiReadUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение списка всех пользователей' }),
    ApiResponse({
      status: 200,
      description: 'Список пользователей успешно получен',
      type: UserListResponse,
    }),
    ApiResponse({ status: 403, description: 'Нет доступа' }),
    ApiAuthWithGuards('can_read:users'),
  );

/**
 * Декоратор для получения пользователя по ID
 * @description Добавляет полную документацию для GET /user/:id эндпоинта
 * @decorators ApiOperation, ApiParam, ApiResponse (200, 404), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_read:user
 */
export const ApiReadUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение пользователя по ID' }),
    ApiParam({ name: 'id', description: 'ID пользователя' }),
    ApiResponse({
      status: 200,
      description: 'Пользователь успешно найден',
      type: UserResponse,
    }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
    ApiAuthWithGuards('can_read:user'),
  );

/**
 * Декоратор для обновления пользователя
 * @description Добавляет полную документацию для PATCH /user/:id эндпоинта
 * @decorators ApiOperation, ApiParam, ApiBody, ApiResponse (200, 404), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_update:user
 */
export const ApiUpdateUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновление данных пользователя' }),
    ApiParam({ name: 'id', description: 'ID пользователя' }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: 200,
      description: 'Данные пользователя успешно обновлены',
      type: UserResponse,
    }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
    ApiAuthWithGuards('can_update:user'),
  );

/**
 * Декоратор для удаления пользователя
 * @description Добавляет полную документацию для DELETE /user/:id эндпоинта
 * @decorators ApiOperation, ApiParam, ApiResponse (200, 404), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_delete:user
 */
export const ApiDeleteUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Удаление пользователя' }),
    ApiParam({ name: 'id', description: 'ID пользователя' }),
    ApiResponse({
      status: 200,
      description: 'Пользователь успешно удален',
      type: 'string',
    }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
    ApiAuthWithGuards('can_delete:user'),
  );

/**
 * Декоратор для получения информации о текущем пользователе
 * @description Добавляет документацию для GET /user/me эндпоинта
 * @decorators ApiOperation, ApiAuth, ApiResponse (200), UseGuards
 * @guards JwtAuthGuard
 */
export const ApiGetMe = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение информации о себе' }),
    ApiAuth(),
    ApiResponse({
      status: 200,
      description: 'Информация о себе успешно получена',
      type: UserMeResponse,
    }),
    UseGuards(JwtAuthGuard),
  );

export const ApiSetUserRoles = () =>
  applyDecorators(
    ApiOperation({ summary: 'Назначение ролей пользователю' }),
    ApiAuth(),
    ApiParam({ name: 'id', description: 'ID пользователя' }),
    ApiBody({
      schema: {
        properties: {
          roles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Массив названий ролей',
            example: ['admin', 'user'],
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Роли успешно назначены пользователю',
    }),
    ApiResponse({
      status: 404,
      description: 'Пользователь или роли не найдены',
      type: UserResponse,
    }),
    ApiAuthWithGuards('can_manage:user_roles'),
  );

export const ApiChangePassword = () =>
  applyDecorators(
    ApiOperation({ summary: 'Смена пароля' }),
    ApiAuth(),
    ApiBody({ type: UpdatePasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Пароль успешно изменен',
      type: UserChangePasswordResponseDto,
    }),
    ApiAuthWithGuards('can_change:own_password'),
  );

// Специфичные декораторы для ролей

/**
 * Декоратор для создания роли
 * @description Добавляет полную документацию для POST /role эндпоинта
 * @decorators ApiOperation, ApiBody, ApiResponse (201, 400), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_create:role
 */
export const ApiCreateRole = () =>
  applyDecorators(
    ApiOperation({ summary: 'Создание новой роли' }),
    ApiBody({ type: CreateRoleDto }),
    ApiResponse({
      status: 201,
      description: 'Роль успешно создана',
      type: RoleResponseWithId,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiAuthWithGuards('can_create:role'),
  );

export const ApiReadRoles = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение списка всех ролей' }),
    ApiResponse({
      status: 200,
      description: 'Список ролей успешно получен',
      type: RoleListResponse,
    }),
    ApiAuthWithGuards('can_read:roles'),
  );

export const ApiReadRole = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение роли по ID' }),
    ApiParam({ name: 'id', description: 'ID роли' }),
    ApiResponse({
      status: 200,
      description: 'Роль успешно найдена',
      type: RoleWithUsersAndPermissions,
    }),
    ApiResponse({ status: 404, description: 'Роль не найдена' }),
    ApiAuthWithGuards('can_read:role'),
  );

export const ApiUpdateRole = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновление данных роли' }),
    ApiParam({ name: 'id', description: 'ID роли' }),
    ApiBody({ type: UpdateRoleDto }),
    ApiResponse({
      status: 200,
      description: 'Данные роли успешно обновлены',
      type: RoleWithUsersAndPermissions,
    }),
    ApiResponse({ status: 404, description: 'Роль не найдена' }),
    ApiAuthWithGuards('can_update:role'),
  );

export const ApiDeleteRole = () =>
  applyDecorators(
    ApiOperation({ summary: 'Удаление роли' }),
    ApiParam({ name: 'id', description: 'ID роли' }),
    ApiResponse({
      status: 204,
      description: 'Роль успешно удалена',
    }),
    ApiResponse({ status: 404, description: 'Роль не найдена' }),
    ApiAuthWithGuards('can_delete:role'),
  );

export const ApiSetRolePermissions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Назначение разрешений роли' }),
    ApiAuth(),
    ApiParam({ name: 'roleName', description: 'Название роли' }),
    ApiBody({
      schema: {
        properties: {
          permissions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Массив названий разрешений',
            example: ['can_read', 'can_write'],
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Разрешения успешно назначены роли',
      type: RoleWithUsersAndPermissions,
    }),
    ApiResponse({ status: 404, description: 'Роль или разрешения не найдены' }),
    ApiAuthWithGuards('can_manage:role_permissions'),
  );

// Специфичные декораторы для разрешений

/**
 * Декоратор для создания разрешения
 * @description Добавляет полную документацию для POST /permission эндпоинта
 * @decorators ApiOperation, ApiBody, ApiResponse (201, 400), ApiAuthWithGuards
 * @guards JwtAuthGuard, PermissionGuard
 * @permission can_create:permission
 */
export const ApiCreatePermission = () =>
  applyDecorators(
    ApiOperation({ summary: 'Создание нового разрешения' }),
    ApiBody({ type: CreatePermissionDto }),
    ApiResponse({
      status: 201,
      description: 'Разрешение успешно создано',
      type: PermissionResponse,
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiAuthWithGuards('can_create:permission'),
  );

export const ApiReadPermissions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение списка всех разрешений' }),
    ApiResponse({
      status: 200,
      description: 'Список разрешений успешно получен',
      type: PermissionListResponse,
    }),
    ApiAuthWithGuards('can_read:permissions'),
  );

export const ApiReadPermission = () =>
  applyDecorators(
    ApiOperation({ summary: 'Получение разрешения по ID' }),
    ApiParam({ name: 'id', description: 'ID разрешения' }),
    ApiResponse({
      status: 200,
      description: 'Разрешение успешно найдено',
      type: PermissionResponse,
    }),
    ApiResponse({ status: 404, description: 'Разрешение не найдено' }),
    ApiAuthWithGuards('can_read:permission'),
  );

export const ApiUpdatePermission = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновление данных разрешения' }),
    ApiParam({ name: 'id', description: 'ID разрешения' }),
    ApiBody({ type: UpdatePermissionDto }),
    ApiResponse({
      status: 200,
      description: 'Данные разрешения успешно обновлены',
      type: PermissionResponse,
    }),
    ApiResponse({ status: 404, description: 'Разрешение не найдено' }),
    ApiAuthWithGuards('can_update:permission'),
  );

export const ApiDeletePermission = () =>
  applyDecorators(
    ApiOperation({ summary: 'Удаление разрешения' }),
    ApiParam({ name: 'id', description: 'ID разрешения' }),
    ApiResponse({
      status: 204,
      description: 'Разрешение успешно удалено',
    }),
    ApiResponse({ status: 404, description: 'Разрешение не найдено' }),
    ApiAuthWithGuards('can_delete:permission'),
  );

// Специфичные декораторы для аутентификации

/**
 * Декоратор для входа в систему
 * @description Добавляет документацию для POST /auth/login эндпоинта
 * @decorators ApiOperation, ApiBody, ApiResponse (200, 401)
 * @guards LocalAuthGuard (применяется в контроллере)
 */
export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Вход в систему' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Успешный вход в систему. Устанавливаются куки access_token и refresh_token',
      type: LoginResponse,
    }),
    ApiResponse({ status: 401, description: 'Неверные учетные данные' }),
  );

/**
 * Декоратор для обновления токена
 * @description Добавляет документацию для POST /auth/refresh эндпоинта
 * @decorators ApiOperation, ApiResponse (200, 401)
 * @description Обновляет access_token используя refresh_token из cookies
 */
export const ApiRefresh = () =>
  applyDecorators(
    ApiOperation({ summary: 'Обновление токена' }),
    ApiResponse({
      status: 200,
      description: 'Токен успешно обновлен. Устанавливаются новые куки',
      type: LoginResponse,
    }),
    ApiResponse({ status: 401, description: 'Невалидный refresh token' }),
  );

/**
 * Декоратор для выхода из системы
 * @description Добавляет документацию для POST /auth/logout эндпоинта
 * @decorators ApiOperation, ApiAuth, ApiResponse (200)
 * @guards JwtAuthGuard (применяется в контроллере)
 * @description Удаляет cookies access_token и refresh_token
 */
export const ApiLogout = () =>
  applyDecorators(
    ApiOperation({ summary: 'Выход из системы' }),
    ApiAuth(),
    ApiResponse({
      status: 200,
      description: 'Успешный выход. Куки удалены',
      type: LoginResponse,
    }),
  );

/**
 * Декоратор для проверки аутентификации
 * @description Добавляет документацию для GET /auth/check эндпоинта
 * @decorators ApiOperation, ApiResponse (200)
 * @guards JwtAuthGuard (применяется в контроллере)
 * @description Возвращает информацию о текущем аутентифицированном пользователе
 */
export const ApiCheckAuth = () =>
  applyDecorators(
    ApiOperation({ summary: 'Проверка аутентификации' }),
    ApiResponse({
      status: 200,
      description: 'Проверка аутентификации прошла успешно',
      type: CheckAuthResponseDto,
    }),
  );
