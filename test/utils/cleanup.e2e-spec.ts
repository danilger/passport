import { cleanupTestEnvironment } from "./cleanup";


describe('Очистка тестового окружения', () => {
  it('должен очистить тестовое окружение', async () => {
    await cleanupTestEnvironment();
  });
}); 