import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_SECRET } from 'src/common/constants/jwt.constant';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: { sub: number }) {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const session = await this.prisma.session.findFirst({
      where: {
        userId: payload.sub,
        refreshToken,
        isRevoke: false,
        expireAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { user: session.user, sessionId: session.id };
  }
}
