import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
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
  })
  @ApiResponse({ status: 403, description: 'Нет доступа' })
  @Get()
  @Permissions('can_read:users')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно найден',
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
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
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
      type: 'object',
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
  @ApiResponse({ status: 404, description: 'Пользователь или роли не найдены' })
  @Post('set-roles/:id')
  @Permissions('can_manage:user_roles')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async setRoleToUser(@Param('id') id: string, @Body('roles') roles: string[]) {
    return this.userService.setRoleToUser(id, roles);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @Permissions('can_change:own_password')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  async changePassword(
    @Body() newPassword: UpdatePasswordDto,
    @Req() req: Request & { user: { userId: string; username: string } },
  ) {
    return await this.userService.changePassword(newPassword, req);
  }
}
