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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { makeParams } from 'src/common/adapters/makeParams';
import {
  ApiChangePassword,
  ApiCreateUser,
  ApiDeleteUser,
  ApiGetMe,
  ApiReadUser,
  ApiReadUsers,
  ApiSetUserRoles,
  ApiUpdateUser,
} from 'src/common/decorators/api.decorators';
import { queryDto } from 'src/common/dto/query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreateUser()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiReadUsers()
  @Get()
  findAll(@Query() query: queryDto) {
    const params = makeParams(query);
    return this.userService.findAll(params);
  }

  @ApiGetMe()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(
    @Req() req: Request & { user: { userId: string; username: string } },
  ) {
    return await this.userService.getMe(req);
  }

  @ApiReadUser()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiUpdateUser()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiDeleteUser()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @ApiSetUserRoles()
  @Post('set-roles/:id')
  @HttpCode(HttpStatus.OK)
  async setRoleToUser(@Param('id') id: string, @Body('roles') roles: string[]) {
    return this.userService.setRoleToUser(id, roles);
  }

  @ApiChangePassword()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() newPassword: UpdatePasswordDto,
    @Req() req: Request & { user: { userId: string; username: string } },
  ) {
    return await this.userService.changePassword(newPassword, req);
  }
}
