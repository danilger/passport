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
  UseGuards
} from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { queryDto } from 'src/common/dto/query.dto';
import { makeParams } from 'src/common/adapters/makeParams';
import { Role } from './entities/role.entity';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Создание новой роли' })
  @ApiCookieAuth()
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Роль успешно создана',
    type: Role

  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Permissions('can_create:role')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Получение списка всех ролей' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Список ролей успешно получен',
  })
  @Permissions('can_read:roles')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  findAll(@Query() query:queryDto) {
    const params = makeParams(query);
    return this.roleService.findAll(params);
  }

  @ApiOperation({ summary: 'Получение роли по ID' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID роли' })
  @ApiResponse({
    status: 200,
    description: 'Роль успешно найдена',
  })
  @ApiResponse({ status: 404, description: 'Роль не найдена' })
  @Permissions('can_read:role')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновление данных роли' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID роли' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Данные роли успешно обновлены',
  })
  @ApiResponse({ status: 404, description: 'Роль не найдена' })
  @Permissions('can_update:role')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Удаление роли' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID роли' })
  @ApiResponse({
    status: 204,
    description: 'Роль успешно удалена',
  })
  @ApiResponse({ status: 404, description: 'Роль не найдена' })
  @Permissions('can_delete:role')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @ApiOperation({ summary: 'Назначение разрешений роли' })
  @ApiCookieAuth()
  @ApiParam({ name: 'roleName', description: 'Название роли' })
  @ApiBody({
    schema: {
      properties: {
        permissions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Массив названий разрешений',
          example: ['can_read', 'can_write']
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Разрешения успешно назначены роли',
  })
  @ApiResponse({ status: 404, description: 'Роль или разрешения не найдены' })
  @Permissions('can_manage:role_permissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post('set-permissions/:roleName')
  setPermissionToRole(
    @Param('roleName') roleName: string,
    @Body() body: { permissions: string[] }
  ) {
    return this.roleService.setPermissionToRole(roleName, body.permissions);
  }
}
