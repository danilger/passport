import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe() {
    return {};
  }
} 