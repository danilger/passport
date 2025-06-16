// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * Guard для JWT аутентификации
 * 
 * @description
 * Обрабатывает процесс JWT аутентификации:
 * 1. Ищет JWT access token в куках или заголовках
 * 2. Проверяет подпись и срок жизни токена
 * 3. При успешной валидации добавляет payload из токена в req.user
 * 
 * @important Guard работает только с JWT токенами и не выполняет проверку имени пользователя и пароля
 * 
 * @usage Используется для защиты приватных маршрутов после успешного логина
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
