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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: '*' },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<number, string> = new Map();

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);

      client.data.userId = payload.sub;
      this.connectedUsers.set(payload.sub, client.id);

      const userConversations = await this.messagesService.getUserConversations(
        payload.sub,
      );

      userConversations.forEach((conv) => {
        client.join(`conversation_${conv.id}`);
      });
      console.log(`User ${payload.sub} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      console.log(`User ${client.data.userId} disconnected`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const message = await this.messagesService.createMessage(
      data,
      client.data.userId,
    );

    this.server
      .to(`conversation_${data.conversationId}`)
      .emit('new_message', message);

    return message;
  }

  @SubscribeMessage('mark_as_seen')
  async handleMarkAsSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number; conversationId: number },
  ) {
    const seen = await this.messagesService.markMessageAsSeen(
      data.messageId,
      client.data.userId,
    );

    this.server.to(`conversation_${data.conversationId}`).emit('message_seen', {
      messageId: data.messageId,
      seenBy: seen.user,
    });
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    client.to(`conversation_${data.conversationId}`).emit('typing', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }
}
