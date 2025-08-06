import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';

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
}
