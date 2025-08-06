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
import { OtpType, User } from '@prisma/client';
import { Request } from 'express';
import { generateOtp } from 'src/common/utils/otp.utils';
import { EmailService } from '../email/email.service';
import { OTP_EXPIRATION_TIME } from 'src/common/constants/otp.constant';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/fotgot-password.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, username } = registerDto;

    const persistedEmail = await this.prisma.user.findFirst({
      where: { email },
    });

    if (persistedEmail) {
      throw new BadRequestException('Email already exists');
    }

    const persistedUsername = await this.prisma.user.findFirst({
      where: { username },
    });

    if (persistedUsername) {
      throw new BadRequestException('Username already exists');
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    await this.prisma.otp.deleteMany({
      where: {
        userId: user.id,
        type: OtpType.PASSWORD_RESET,
      },
    });

    const { otp, expireAt } = generateOtp();
    await this.prisma.otp.create({
      data: {
        userId: user.id,
        code: otp.toString(),
        type: OtpType.PASSWORD_RESET,
        expireAt,
      },
    });

    await this.emailService.sendEmail(
      user.email,
      otp.toString(),
      user.firstName,
      OTP_EXPIRATION_TIME,
    );

    return {
      message: 'OTP has been sent to your email',
    };
  }

  async verify(verifyDto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyDto.email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    const otp = await this.prisma.otp.findFirst({
      where: {
        code: verifyDto.otp,
        userId: user.id,
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otp.expireAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    await this.prisma.otp.delete({
      where: { id: otp.id },
    });

    return {
      message: 'OTP verified successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      throw new BadRequestException('Email is not exists');
    }

    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const hashedPassword = await hashPassword(resetPasswordDto.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
