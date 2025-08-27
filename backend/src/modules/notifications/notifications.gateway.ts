import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { JWT_SECRET } from 'src/common/constants/jwt.constant';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      client.data.userId = payload.sub;
      client.join(`user_${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {}

  @SubscribeMessage('send-notification')
  async sendNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateNotificationDto,
  ) {
    const notification = await this.notificationsService.createNotification(
      client.data.userId,
      data,
    );

    this.server
      .to(`user_${data.receiver}`)
      .emit('new_notification', notification);
  }
}
