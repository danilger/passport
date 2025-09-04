import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { makeParams } from 'src/common/adapters/makeParams';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { queryDto } from 'src/common/dto/query.dto';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserChangePasswordResponseDto } from './dto/user-change-password-response.dto';
import { UserListResponse } from './dto/user-list-response.dto';
import { UserResponse, UserWithoutRoles } from './dto/user-response.dto';
import { UserMeResponse } from './dto/userme-response';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: UserWithoutRoles,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Post()
  @Permissions('can_create:user')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Получение списка всех пользователей' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Список пользователей успешно получен',
    type: UserListResponse,
  })
  @ApiResponse({ status: 403, description: 'Нет доступа' })
  @Get()
  @Permissions('can_read:users')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  findAll(@Query() query: queryDto) {
    const params = makeParams(query);
    return this.userService.findAll(params);
  }

  @ApiOperation({ summary: 'Получение информации о себе' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Информация о себе успешно получена',
    type: UserMeResponse,
  })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(
    @Req() req: Request & { user: { userId: string; username: string } },
  ) {
    return await this.userService.getMe(req);
  }

  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно найден',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':id')
  @Permissions('can_read:user')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновление данных пользователя' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя успешно обновлены',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Patch(':id')
  @Permissions('can_update:user')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно удален',
    type: 'string',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  @Delete(':id')
  @Permissions('can_delete:user')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: 'Назначение ролей пользователю' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({
    schema: {
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Массив названий ролей',
          example: ['admin', 'user'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Роли успешно назначены пользователю',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь или роли не найдены',
    type: UserResponse,
  })
  @Post('set-roles/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('can_manage:user_roles')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async setRoleToUser(@Param('id') id: string, @Body('roles') roles: string[]) {
    return this.userService.setRoleToUser(id, roles);
  }

  @ApiOperation({ summary: 'Смена пароля' })
  @ApiCookieAuth()
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно изменен',
    type: UserChangePasswordResponseDto,
  })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @Permissions('can_change:own_password')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async changePassword(
    @Body() newPassword: UpdatePasswordDto,
    @Req() req: Request & { user: { userId: string; username: string } },
  ) {
    return await this.userService.changePassword(newPassword, req);
  }
}
