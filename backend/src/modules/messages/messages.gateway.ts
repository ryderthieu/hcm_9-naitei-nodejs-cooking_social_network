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
import { JWT_SECRET } from 'src/common/constants/jwt.constant';

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
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      client.data.userId = payload.sub;
      this.connectedUsers.set(payload.sub, client.id);

      const userConversations = await this.messagesService.getUserConversations(
        payload.sub,
      );

      userConversations.forEach((conv) => {
        client.join(`conversation_${conv.id}`);
      });

      this.server.emit('user_online', { userId: payload.sub });
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      this.server.emit('user_offline', { userId: client.data.userId });
    }
  }

  private conversationUpdate(conversationId: number, client: Socket) {
    client.to(`conversation_${conversationId}`).emit('conversation_update', {
      conversationId,
    });
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    return { onlineUsers };
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

    this.conversationUpdate(data.conversationId, client);

    return message;
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number; conversationId: number },
  ) {
    const deletedMessage = await this.messagesService.deleteMessage(
      data.messageId,
    );

    this.server
      .to(`conversation_${deletedMessage.conversationId}`)
      .emit('message_deleted', deletedMessage);

    this.conversationUpdate(data.conversationId, client);
  }

  @SubscribeMessage('mark_as_seen')
  async handleMarkAsSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ) {
    const seenMessages = await this.messagesService.markMessageAsSeen(
      data.conversationId,
      client.data.userId,
    );

    this.server.to(`conversation_${data.conversationId}`).emit('message_seen', {
      conversationId: data.conversationId,
      userId: client.data.userId,
      seenMessages,
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
