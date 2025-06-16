import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv'; // 6.8k (gzipped: 2.9k)
import { join } from 'path';

// Загрузка переменных окружения из .env-файла
dotenv.config();

// Экспорт конфигурации подключения к PostgreSQL
export default new DataSource({
  type: 'postgres', // Тип СУБД
  host: process.env.HOST,
  port: Number(process.env.DB_PORT) || 5433,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  synchronize: false, // Отключение автоматической синхронизации схемы
  dropSchema: false, // Запрет на удаление схемы при запуске
  logging: false, // Отключение логгирования запросов
  logger: 'file', // Тип логгера (если включено)
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')], // Пути к сущностям
  migrations: [join(__dirname, '..', 'migrations', '**', '*.{ts,js}')], // Пути к миграциям
  subscribers: [join(__dirname, '..', 'subscriber', '**', '*.{ts,js}')], // Пути к подписчикам событий
  migrationsTableName: 'migrations', // Название таблицы для хранения миграций
});
