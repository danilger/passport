import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Создание нового разрешения' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Разрешение успешно создано',
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @ApiOperation({ summary: 'Получение списка всех разрешений' })
  @ApiResponse({
    status: 200,
    description: 'Список разрешений успешно получен',
  })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @ApiOperation({ summary: 'Получение разрешения по ID' })
  @ApiParam({ name: 'id', description: 'ID разрешения' })
  @ApiResponse({
    status: 200,
    description: 'Разрешение успешно найдено',
  })
  @ApiResponse({ status: 404, description: 'Разрешение не найдено' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @ApiOperation({ summary: 'Обновление данных разрешения' })
  @ApiParam({ name: 'id', description: 'ID разрешения' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Данные разрешения успешно обновлены',
  })
  @ApiResponse({ status: 404, description: 'Разрешение не найдено' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Удаление разрешения' })
  @ApiParam({ name: 'id', description: 'ID разрешения' })
  @ApiResponse({
    status: 204,
    description: 'Разрешение успешно удалено',
  })
  @ApiResponse({ status: 404, description: 'Разрешение не найдено' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
