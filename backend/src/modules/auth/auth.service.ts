import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import {
  comparePassword,
  hashPassword,
} from 'src/common/utils/hash-password.utils';
import { LoginDto } from './dto/login.dto';
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from 'src/common/constants/jwt.constant';
import * as ms from 'ms';
import { User } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, username } = registerDto;

    const persistedUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (persistedUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
      },
      select: {
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return { user };
  }

  async login(loginDto: LoginDto, req: Request) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestException('Password is incorrect');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: JWT_SECRET,
          expiresIn: JWT_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: JWT_REFRESH_SECRET,
          expiresIn: JWT_REFRESH_EXPIRES_IN,
        },
      ),
    ]);

    const expiresAt = new Date(Date.now() + ms(JWT_REFRESH_EXPIRES_IN));

    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: ip,
        userAgent,
        expireAt: expiresAt,
      },
    });

    return {
      user: {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(currentUser: User, sessionId: number) {
    await this.prisma.session.update({
      where: { id: sessionId, userId: currentUser.id },
      data: {
        isRevoke: true,
      },
    });

    return { message: 'Logout successfully' };
  }

  async refresh(currentUser: User, sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.isRevoke || session.expireAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const accessToken = this.jwtService.sign(
      { sub: currentUser.id },
      {
        secret: JWT_SECRET,
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    return { accessToken };
  }
}
