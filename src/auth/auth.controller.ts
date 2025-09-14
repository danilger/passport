import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ApiCheckAuth,
  ApiLogin,
  ApiLogout,
  ApiRefresh,
} from 'src/common/decorators/api.decorators';
import { AuthService, UserWithRolesAndPermissions } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @ApiLogin()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request & { user: UserWithRolesAndPermissions },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id, username, roles = [], permissions = [] } = req.user;

    const payload = {
      sub: id,
      username,
      roles,
      permissions,
    };

    const tokens = await this.authService.getTokens(payload);

    // const isTestEnvironment = process.env.NODE_ENV === 'test';

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: false, //ВАЖНО НА ПРОДЕ СДЛЕЛАТЬ true         !isTestEnvironment,
      sameSite: 'lax', //ВАЖНО НА ПРОДЕ СДЛЕЛАТЬ strict     isTestEnvironment ? 'lax' : 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: false, //ВАЖНО НА ПРОДЕ СДЛЕЛАТЬ true         !isTestEnvironment,
      sameSite: 'lax', //ВАЖНО НА ПРОДЕ СДЛЕЛАТЬ strict     isTestEnvironment ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    return { message: 'Вход выполнен успешно' };
  }

  @ApiRefresh()
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refresh = req.cookies?.['refresh_token'];
    if (!refresh)
      throw new UnauthorizedException('Токен обновления отсутствует');

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refresh, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Невалидный токен обновления');
    }

    const { sub, username, roles = [], permissions = [] } = payload;

    const tokens = await this.authService.getTokens({
      sub,
      username,
      roles,
      permissions,
    });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    return { message: 'Токен успешно обновлен' };
  }

  @ApiLogout()
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
    });
    return { message: 'Выход выполнен успешно' };
  }

  @ApiCheckAuth()
  @Get('check')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkAuth(@Req() req: Request & { user: UserWithRolesAndPermissions }) {
    const { id, username, roles = [], permissions = [] } = req.user;

    return {
      message: 'Проверка аутентификации прошла успешно',
      user: {
        id,
        username,
        roles,
        permissions,
      },
    };
  }
}
