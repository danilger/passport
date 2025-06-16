# Passport - Система управления доступом

Проект представляет собой backend-сервис на NestJS для управления пользователями, ролями и разрешениями с использованием JWT-авторизации.

## Особенности проекта

- 🔐 **Многоуровневая система доступа**
  - Управление пользователями
  - Управление ролями
  - Управление разрешениями
  - Гибкая система назначения ролей и разрешений

- 🛡️ **Безопасность**
  - JWT-авторизация
  - Защита endpoints с помощью Guards
  - Валидация входящих данных
  - Безопасное хранение паролей

- 📝 **Документация API**
  - Полная Swagger-документация
  - Описание всех endpoints на русском языке
  - Примеры запросов и ответов
  - Документированные DTO и сущности

- 🎯 **Технические особенности**
  - TypeScript
  - PostgreSQL в качестве базы данных
  - TypeORM для работы с БД
  - Миграции для управления схемой БД
  - Модульная архитектура
  - Dependency Injection
  - Repository pattern

## Установка и запуск

### Предварительные требования

- Node.js (версия 16 или выше)
- PostgreSQL (версия 12 или выше)
- npm (версия 8 или выше)

### Установка зависимостей

```bash
npm install
```

### Настройка базы данных

1. Создайте базу данных PostgreSQL
2. Скопируйте `.env.example` в `.env`
3. Настройте параметры подключения к БД в `.env`

### Миграции

```bash
# Создание миграции
npm run migration:generate

# Применение миграций
npm run migration:run

# Откат миграций
npm run migration:revert
```

### Запуск приложения

```bash
# Режим разработки
npm run start:dev

# Продакшн режим
npm run start:prod
```

## API Endpoints

### Авторизация

- `POST /auth/login` - Вход в систему
- `POST /auth/register` - Регистрация нового пользователя

### Пользователи

- `GET /users` - Получение списка пользователей
- `GET /users/:id` - Получение информации о пользователе
- `PATCH /users/:id` - Обновление данных пользователя
- `DELETE /users/:id` - Удаление пользователя

### Роли

- `POST /role` - Создание новой роли
- `GET /role` - Получение списка ролей
- `GET /role/:id` - Получение информации о роли
- `PATCH /role/:id` - Обновление роли
- `DELETE /role/:id` - Удаление роли
- `POST /role/:name/permissions` - Назначение разрешений роли

### Разрешения

- `POST /permission` - Создание нового разрешения
- `GET /permission` - Получение списка разрешений
- `GET /permission/:id` - Получение информации о разрешении
- `PATCH /permission/:id` - Обновление разрешения
- `DELETE /permission/:id` - Удаление разрешения

## Особенности реализации

### Связи между сущностями

- **User-Role**: Many-to-Many связь через таблицу `user_roles_roles`
- **Role-Permission**: Many-to-Many связь через таблицу `roles_permissions`

### Ролевая модель (RBAC)

#### Основные компоненты

1. **Пользователи (Users)**
   - Каждый пользователь может иметь несколько ролей
   - При регистрации пользователю автоматически назначается роль "user"
   - Пользователь наследует все разрешения от своих ролей
   - Один пользователь может иметь несколько ролей одновременно

2. **Роли (Roles)**
   - Представляют собой группы разрешений
   - Каждая роль может содержать множество разрешений
   - Предустановленные роли:
     * `admin` - полный доступ ко всем функциям
     * `user` - базовый доступ к системе
     * `moderator` - доступ к модерации контента
   - Возможность создания кастомных ролей

3. **Разрешения (Permissions)**
   - Определяют конкретные действия в системе
   - Могут быть назначены нескольким ролям
   - Примеры разрешений:
     * `create_user` - создание пользователей
     * `delete_user` - удаление пользователей
     * `edit_role` - редактирование ролей
     * `view_logs` - просмотр логов

#### Иерархия и наследование

```
User (Пользователь)
  ↓
Role (Роль)
  ↓
Permission (Разрешение)
```

- Пользователь получает все разрешения от назначенных ему ролей
- Роли могут иметь пересекающиеся наборы разрешений
- При проверке доступа учитываются все разрешения из всех ролей пользователя

#### Проверка прав доступа

1. **На уровне контроллеров**
```typescript
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete('users/:id')
remove(@Param('id') id: string) {
  // ...
}
```

2. **На уровне сервисов**
```typescript
// Проверка наличия разрешения
if (!user.roles.some(role => 
  role.permissions.some(permission => 
    permission.name === 'delete_user'
  )
)) {
  throw new ForbiddenException();
}
```

#### Управление ролями и разрешениями

1. **Назначение ролей пользователю**
```http
POST /users/{userId}/roles
{
  "roles": ["admin", "moderator"]
}
```

2. **Назначение разрешений роли**
```http
POST /roles/{roleId}/permissions
{
  "permissions": ["create_user", "edit_user"]
}
```

#### Безопасность

- Проверка прав происходит на каждый защищенный endpoint
- Невозможно удалить последнюю роль у пользователя
- Системные роли (admin, user) нельзя удалить
- При удалении роли или разрешения:
  * Проверяется наличие зависимых сущностей
  * Производится очистка связей в промежуточных таблицах
  * Сохраняется целостность данных

#### Примеры использования

1. **Создание новой роли с разрешениями**
```typescript
// Создание роли
const role = await roleService.create({ name: 'content_manager' });

// Назначение разрешений
await roleService.setPermissions(role.id, [
  'create_content',
  'edit_content',
  'delete_content'
]);
```

2. **Проверка прав пользователя**
```typescript
// В сервисе
async checkUserPermission(userId: string, permissionName: string): Promise<boolean> {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['roles', 'roles.permissions']
  });

  return user.roles.some(role => 
    role.permissions.some(permission => 
      permission.name === permissionName
    )
  );
}
```

### Обработка ошибок

- Кастомные исключения для различных ситуаций
- Информативные сообщения об ошибках на русском языке
- Корректная обработка конфликтов при удалении связанных сущностей

### Безопасность

- Хеширование паролей с использованием bcrypt
- Валидация входящих данных через DTO
- Защита endpoints с помощью JWT и ролевых гвардов

### Аутентификация с Passport.js

#### Общее описание

[Passport.js](http://www.passportjs.org/) - это middleware для Node.js, который упрощает процесс аутентификации. В нашем проекте он интегрирован с NestJS и используется для:
- JWT аутентификации
- Защиты маршрутов
- Управления сессиями

#### Реализованные стратегии

1. **JWT Strategy**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

2. **Local Strategy** (для логина по username/password)
```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }
    return user;
  }
}
```

#### Процесс аутентификации

1. **Вход в систему**
```typescript
// 1. Пользователь отправляет credentials
POST /auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

// 2. LocalStrategy проверяет credentials
// 3. В случае успеха генерируется JWT токен
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

2. **Защита маршрутов**
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

#### Особенности реализации

1. **Конфигурация модуля**
```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { 
          expiresIn: '24h',
          audience: 'passport-app',
          issuer: 'passport-auth'
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

2. **Безопасность токенов**
- Ограниченный срок жизни (24 часа)
- Подпись с использованием секретного ключа
- Проверка издателя и аудитории
- Защита от XSS и CSRF атак

3. **Обработка ошибок**
```typescript
try {
  const user = await this.authService.validateUser(username, password);
  return this.authService.login(user);
} catch (error) {
  if (error instanceof UnauthorizedException) {
    throw error;
  }
  throw new InternalServerErrorException('Ошибка аутентификации');
}
```

#### Преимущества использования Passport.js

1. **Гибкость**
   - Легкое добавление новых стратегий аутентификации
   - Поддержка OAuth (Google, Facebook и др.)
   - Возможность комбинировать различные стратегии

2. **Безопасность**
   - Проверенные временем стратегии
   - Защита от основных видов атак
   - Поддержка современных стандартов безопасности

3. **Интеграция**
   - Отличная совместимость с NestJS
   - Поддержка TypeScript
   - Простая интеграция с базами данных

4. **Масштабируемость**
   - Легкое добавление новых провайдеров
   - Поддержка кастомных стратегий
   - Возможность горизонтального масштабирования

## Разработка

### Структура проекта

```
src/
├── auth/           # Модуль аутентификации
├── user/           # Модуль пользователей
├── role/           # Модуль ролей
├── permission/     # Модуль разрешений
├── common/         # Общие компоненты
└── database/       # Конфигурация базы данных
```

### Добавление новых функций

1. Создайте новый модуль: `nest g module name`
2. Создайте контроллер: `nest g controller name`
3. Создайте сервис: `nest g service name`
4. Добавьте необходимые DTO и entities
5. Обновите документацию Swagger

## Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Test coverage
npm run test:cov
```

## Лицензия

MIT