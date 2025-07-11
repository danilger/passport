import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Создаем красивый логгер
  const logger = new Logger('App');

  // Создаем приложение с настроенным логгером
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: false,
  });
  // Настраиваем CORS для работы с фронтендом
  app.enableCors({
    origin: 'http://127.0.0.1:5173', // URL нашего фронтенда
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', ],
    credentials: true, // Разрешаем передачу кук
  });

  // Добавляем глобальную валидацию
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
      disableErrorMessages: false,
    }),
  );

  // Включаем глобальную сериализацию для автоматического исключения @Exclude() полей из ответов
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Passport API')
    .setDescription(
      'API документация для системы управления пользователями, ролями и разрешениями\n\n' +
        'Спецификация OpenAPI доступна в формате JSON: [openapi.json](/api/openapi.json)',
    )
    .setVersion('1.0')
    .addTag('app', 'Общая информация о сервисе')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('user', 'Управление пользователями')
    .addTag('role', 'Управление ролями')
    .addTag('permission', 'Управление разрешениями')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Сохраняем спецификацию в JSON файл
  const outputPath = path.resolve(process.cwd(), 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  });

  // Создаем GET эндпоинт для openapi.json
  app.getHttpAdapter().get('/api/openapi.json', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.send(document);
  });

  SwaggerModule.setup('api/docs', app, document);

  app.use(cookieParser());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});
