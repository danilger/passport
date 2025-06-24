import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Загружаем конфигурацию из .env.test
config({ path: '.env.test' });

export const testDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST,
  port: parseInt(process.env.TEST_DB_PORT || '5434'),
  username: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: 'test_db',
  entities: [join(__dirname, '..', 'src', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: true, // В тестовом окружении можно использовать synchronize
  logging: false,
};

const testDataSource = new DataSource(testDataSourceOptions);
export default testDataSource; 