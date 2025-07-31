import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import * as ms from 'ms';
import { JWT_REFRESH_EXPIRES_IN } from 'src/common/constants/jwt.constant';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body('user') registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body('user') loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.login(
      loginDto,
      req,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: ms(JWT_REFRESH_EXPIRES_IN),
    });

    return { user, accessToken };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-refresh'))
  async logout(
    @CurrentUser('user') currentUser: User,
    @CurrentUser('sessionId') sessionId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refreshToken');

    return this.authService.logout(currentUser, sessionId);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @CurrentUser('user') currentUser: User,
    @CurrentUser('sessionId') sessionId: number,
  ) {
    return this.authService.refresh(currentUser, sessionId);
  }
}
