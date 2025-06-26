import { execSync } from 'child_process';

/**
 * Очищает тестовое окружение: останавливает и удаляет Docker контейнер и его тома
 */
export async function cleanupTestEnvironment(): Promise<void> {
  try {
    process.stdout.write('\nОчистка тестового окружения:\n');
    const containerName = 'test-db';
    const volumeName = 'passport_test-db-data';
    
    // Проверяем существует ли контейнер
    try {
      execSync(`docker container inspect ${containerName}`, { stdio: 'ignore' });
      // Если контейнер существует, останавливаем и удаляем его
      execSync(`docker stop ${containerName}`, { stdio: 'inherit' });
      execSync(`docker rm ${containerName}`, { stdio: 'inherit' });
      process.stdout.write(`Контейнер ${containerName} остановлен и удален\n`);
    } catch {
      process.stdout.write(`Контейнер ${containerName} не найден\n`);
    }

    // Проверяем и удаляем том
    try {
      execSync(`docker volume inspect ${volumeName}`, { stdio: 'ignore' });
      execSync(`docker volume rm ${volumeName}`, { stdio: 'inherit' });
      process.stdout.write(`Том ${volumeName} удален\n`);
    } catch {
      process.stdout.write(`Том ${volumeName} не найден\n`);
    }
  } catch (error) {
    process.stdout.write(`Ошибка при очистке тестового окружения: ${error.message}\n`);
  }
} 