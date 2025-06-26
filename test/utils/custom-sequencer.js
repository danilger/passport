const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Определяем порядок файлов
    const orderPath = {
      'app.e2e-spec.ts': 1,      // Первым запускаем основной тест приложения
      'auth.e2e-spec.ts': 2,     // Затем тесты аутентификации
      'user-crud.e2e-spec.ts': 3, // Затем CRUD операции с пользователями
      'user-operations.e2e-spec.ts': 4, // Затем специальные операции с пользователями
      'role-crud.e2e-spec.ts': 5, // Затем тесты ролей
      'cleanup.e2e-spec.ts': 6  // В самом конце очистка окружения
    };

    return tests.sort((testA, testB) => {
      const fileA = testA.path.split('/').pop();
      const fileB = testB.path.split('/').pop();

      const indexA = orderPath[fileA] || 99; // Файлы без явного порядка идут предпоследними
      const indexB = orderPath[fileB] || 99;

      return indexA - indexB;
    });
  }
}

module.exports = CustomSequencer;