/**
 * Класс для работы с API, обеспечивающий управление cookies и выполнение HTTP запросов
 * @class
 */
export class Api  {
    /** Хранилище для cookies в формате ключ-значение */
    public cookies: { [key: string]: string }  = {}

    /**
     * Создает экземпляр Api класса
     * @param {string} baseUrl - Базовый URL для API запросов
     */
    constructor( private baseUrl: string) {}

    /**
     * Выполняет HTTP запрос с поддержкой cookies
     * @param {string} endpoint - Конечная точка API
     * @param {RequestInit} [options={}] - Опции для fetch запроса
     * @returns {Promise<Response>} Ответ от сервера
     * @description Автоматически управляет cookies:
     * - Отправляет access_token в заголовке cookie если есть
     * - Сохраняет полученные cookies из set-cookie заголовка
     */
    async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    if (this.cookies && Object.keys(this.cookies).length > 0) {
      // console.log('Sending cookies:', this.cookies);
      if (!options.headers) {
        options.headers = {};
      }
      if (options.headers && typeof options.headers === 'object') {
        (options.headers as Record<string, string>)['cookie'] = `access_token=${this.cookies.access_token}`;
        // console.log('Cookie header:', (options.headers as Record<string, string>)['cookie']);
      }
    }

    const response = await fetch(url, options);
    
    // Сохраняем cookies из ответа
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // console.log('Received Set-Cookie:', setCookieHeader);
      const cookieStrings = setCookieHeader.split(',').map(str => str.trim());
      for (const cookieStr of cookieStrings) {
        const [keyValue] = cookieStr.split(';');
        if (keyValue) {
          const [key, value] = keyValue.split('=');
          if (key && value) {
            this.cookies[key.trim()] = value.trim();
          }
        }
      }
      // console.log('Updated cookies:', this.cookies);
    }

    if (response.status === 401) {
      console.error('Unauthorized:', await response.text());
    }

    return response;
  }

  /**
   * Выполняет аутентификацию пользователя
   * @param {string} username - Имя пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Response>} Ответ от сервера с токенами доступа
   */
  async login(username: string, password: string) {
    return this.fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  }

}