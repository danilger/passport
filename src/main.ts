import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Включаем глобальную сериализацию для автоматического исключения @Exclude() полей из ответов
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Passport API')
    .setDescription(
      'API документация для системы управления пользователями, ролями и разрешениями',
    )
    .setVersion('1.0')
    .addTag('app', 'Общая информация о сервисе')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('users', 'Управление пользователями')
    .addTag('roles', 'Управление ролями')
    .addTag('permissions', 'Управление разрешениями')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use(cookieParser());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
