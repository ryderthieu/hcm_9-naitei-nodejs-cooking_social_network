import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('user') user: User,
    @Body() createConversationDto: CreateConversationDto
  ) {
    return this.conversationsService.createConversation(user.id, createConversationDto);
  }

  @Get()
  async getUserConversations(
    @CurrentUser('user') user: User,
    @Query() queryDto: GetConversationsQueryDto
  ) {
    return this.conversationsService.getUserConversations(user.id, queryDto);
  }

  @Get(':id')
  async getConversation(
    @Param('id', ParseIntPipe) conversationId: number,
    @CurrentUser('user') user: User
  ) {
    return this.conversationsService.getConversation(conversationId, user.id);
  }

  @Put(':id')
  async updateConversation(
    @Param('id', ParseIntPipe) conversationId: number,
    @CurrentUser('user') user: User,
    @Body() updateConversationDto: UpdateConversationDto
  ) {
    return this.conversationsService.updateConversation(
      conversationId,
      user.id,
      updateConversationDto
    );
  }

  @Delete(':id')
  async deleteConversation(
    @Param('id', ParseIntPipe) conversationId: number,
    @CurrentUser('user') user: User
  ) {
    return this.conversationsService.deleteConversation(conversationId, user.id);
  }
}
