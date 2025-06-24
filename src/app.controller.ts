import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api')
  @ApiOperation({ summary: 'Получить информацию о сервисе' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает краткое описание сервиса и ссылку на документацию',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Passport Service' },
        description: { type: 'string' },
        documentation: { type: 'string', format: 'uri' }
      }
    }
  })
  getApiInfo() {
    return {
      name: 'Passport Service',
      description: 'Сервис управления пользователями, ролями и разрешениями',
      documentation: '/api/docs'
    };
  }
}
