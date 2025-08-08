import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesGateway } from './messages.gateway';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [PrismaModule, JwtModule],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
})
export class MessagesModule {}
