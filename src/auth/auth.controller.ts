import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService, UserWithRolesAndPermissions } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description:
      'Успешный вход в систему. Устанавливаются куки access_token и refresh_token',
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Req() req: Request & { user: UserWithRolesAndPermissions },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id, username, roles = [], permissions = [] } = req.user;
    
    const payload = {
      sub: id,
      username,
      roles,
      permissions
    };

    const tokens = await this.authService.getTokens(payload);

    const isTestEnvironment = process.env.NODE_ENV === 'test';

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: !isTestEnvironment,
      sameSite: isTestEnvironment ? 'lax' : 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: !isTestEnvironment,
      sameSite: isTestEnvironment ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    return { message: 'Вход выполнен успешно' };
  }

  @ApiOperation({ summary: 'Обновление токена' })
  @ApiResponse({
    status: 200,
    description: 'Токен успешно обновлен. Устанавливаются новые куки',
  })
  @ApiResponse({ status: 401, description: 'Невалидный refresh token' })
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
      permissions
    });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
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

  @ApiOperation({ summary: 'Выход из системы' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Успешный выход. Куки удалены',
  })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Выход выполнен успешно' };
  }
}
