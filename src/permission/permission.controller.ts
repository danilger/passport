import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
