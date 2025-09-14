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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { makeParams } from 'src/common/adapters/makeParams';
import {
  ApiCreatePermission,
  ApiDeletePermission,
  ApiReadPermission,
  ApiReadPermissions,
  ApiUpdatePermission,
} from 'src/common/decorators/api.decorators';
import { queryDto } from 'src/common/dto/query.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';

@ApiTags('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiCreatePermission()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @ApiReadPermissions()
  @Get()
  findAll(@Query() query: queryDto) {
    const params = makeParams(query);
    return this.permissionService.findAll(params);
  }

  @ApiReadPermission()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @ApiUpdatePermission()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @ApiDeletePermission()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
