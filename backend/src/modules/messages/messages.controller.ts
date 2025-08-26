import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { GetMessagesContextDto } from './dto/get-messages-context.dto';

@Controller('conversations')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':conversationId/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('conversationId') conversationId: number,
    @Query() query: GetMessagesQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.messagesService.getMessages(conversationId, query, currentUser);
  }

  @Get(':conversationId/messages/:messageId/context')
  @UseGuards(JwtAuthGuard)
  async getMessageContext(
    @Param('conversationId') conversationId: number,
    @Param('messageId') messageId: number,
    @Query() query: GetMessagesContextDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.messagesService.getMessagesContext(
      conversationId,
      messageId,
      query,
      currentUser,
    );
  }
}
