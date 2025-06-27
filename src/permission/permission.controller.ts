import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Создание нового разрешения' })
  @ApiCookieAuth()
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Разрешение успешно создано',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Permissions('can_create:permission')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @ApiOperation({ summary: 'Получение списка всех разрешений' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Список разрешений успешно получен',
  })
  @Permissions('can_read:permissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @ApiOperation({ summary: 'Получение разрешения по ID' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID разрешения' })
  @ApiResponse({
    status: 200,
    description: 'Разрешение успешно найдено',
  })
  @ApiResponse({ status: 404, description: 'Разрешение не найдено' })
  @Permissions('can_read:permission')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновление данных разрешения' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID разрешения' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Данные разрешения успешно обновлены',
  })
  @ApiResponse({ status: 404, description: 'Разрешение не найдено' })
  @Permissions('can_update:permission')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Удаление разрешения' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'ID разрешения' })
  @ApiResponse({
    status: 204,
    description: 'Разрешение успешно удалено',
  })
  @ApiResponse({ status: 404, description: 'Разрешение не найдено' })
  @Permissions('can_delete:permission')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
