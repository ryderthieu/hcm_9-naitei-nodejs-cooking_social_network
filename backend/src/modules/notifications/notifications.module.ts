import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [PrismaService, JwtModule],
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
