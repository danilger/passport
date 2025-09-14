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
  ApiCreateRole,
  ApiDeleteRole,
  ApiReadRole,
  ApiReadRoles,
  ApiSetRolePermissions,
  ApiUpdateRole,
} from 'src/common/decorators/api.decorators';
import { queryDto } from 'src/common/dto/query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiCreateRole()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiReadRoles()
  @Get()
  findAll(@Query() query: queryDto) {
    const params = makeParams(query);
    return this.roleService.findAll(params);
  }

  @ApiReadRole()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiUpdateRole()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiDeleteRole()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @ApiSetRolePermissions()
  @Post('set-permissions/:roleName')
  setPermissionToRole(
    @Param('roleName') roleName: string,
    @Body() body: { permissions: string[] },
  ) {
    return this.roleService.setPermissionToRole(roleName, body.permissions);
  }
}
