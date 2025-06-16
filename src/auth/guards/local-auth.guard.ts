// src/auth/guards/local-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


/**
 * Guard для локальной аутентификации
 * 
 * @description
 * Обрабатывает процесс локальной аутентификации:
 * 1. Извлекает username и password из req.body
 * 2. Проверяет учетные данные через validateUser()
 * 3. При успешной валидации добавляет объект user в req.user
 * 
 * @important Guard работает только с учетными данными (username/password) и не обрабатывает JWT токены
 * 
 * @usage Используется только на этапе логина
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
