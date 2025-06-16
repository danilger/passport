import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Создание новой роли' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Роль успешно создана',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Получение списка всех ролей' })
  @ApiResponse({
    status: 200,
    description: 'Список ролей успешно получен',
  })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @ApiOperation({ summary: 'Получение роли по ID' })
  @ApiParam({ name: 'id', description: 'ID роли' })
  @ApiResponse({
    status: 200,
    description: 'Роль успешно найдена',
  })
  @ApiResponse({ status: 404, description: 'Роль не найдена' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновление данных роли' })
  @ApiParam({ name: 'id', description: 'ID роли' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Данные роли успешно обновлены',
  })
  @ApiResponse({ status: 404, description: 'Роль не найдена' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Удаление роли' })
  @ApiParam({ name: 'id', description: 'ID роли' })
  @ApiResponse({
    status: 204,
    description: 'Роль успешно удалена',
  })
  @ApiResponse({ status: 404, description: 'Роль не найдена' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @ApiOperation({ summary: 'Назначение разрешений роли' })
  @ApiParam({ name: 'roleName', description: 'Название роли' })
  @ApiBody({
    schema: {
      type: 'object',
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
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('set-permissions/:roleName')
  setPermissionToRole(
    @Param('roleName') roleName: string,
    @Body() body: { permissions: string[] }
  ) {
    return this.roleService.setPermissionToRole(roleName, body.permissions);
  }
}
