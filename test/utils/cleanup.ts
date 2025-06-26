import { execSync } from 'child_process';

/**
 * Очищает тестовое окружение: останавливает и удаляет Docker контейнер
 */
export async function cleanupTestEnvironment(): Promise<void> {
  try {
    process.stdout.write('\nОчистка тестового окружения:\n');
    const containerName = 'test-db';
    
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
  } catch (error) {
    process.stdout.write(`Ошибка при очистке тестового окружения: ${error.message}\n`);
  }
} 