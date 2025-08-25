import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import {
  LIMIT_DEFAULT,
  PAGE_DEFAULT,
} from 'src/common/constants/pagination.constants';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesContextDto } from './dto/get-messages-context.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(
    conversationId: number,
    query: GetMessagesQueryDto,
    currentUser: User,
  ) {
    const { limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = query;

    const isMember = await this.prisma.member.findFirst({
      where: {
        conversationId,
        userId: currentUser.id,
      },
    });

    if (!isMember) {
      throw new UnauthorizedException(
        'You are not a member of this conversation',
      );
    }

    const offset = (page - 1) * limit;

    const whereCondition: any = {
      conversationId,
    };

    if (query.search && query.search.trim()) {
      whereCondition.type = 'TEXT';
      whereCondition.content = {
        contains: query.search,
      };
    }

    if (query.from || query.to) {
      whereCondition.createdAt = {};
      if (query.from) {
        whereCondition.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        whereCondition.createdAt.lte = new Date(query.to);
      }
    }

    if (query.senderId) {
      whereCondition.sender = query.senderId;
    }

    const totalMessages = await this.prisma.message.count({
      where: whereCondition,
    });

    const messages = await this.prisma.message.findMany({
      where: whereCondition,
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyToMessage: {
          include: {
            senderUser: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(totalMessages / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      messages: messages.reverse(),
      meta: {
        currentPage: page,
        totalPages,
        totalMessages,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      searchInfo: {
        query: query.search || '',
        hasSearch: !!(query.search && query.search.trim()),
      },
    };
  }

  async getMessagesContext(
    conversationId: number,
    messageId: number,
    query: GetMessagesContextDto,
    currentUser: User,
  ) {
    const { before = LIMIT_DEFAULT, after = LIMIT_DEFAULT } = query;

    const isMember = await this.prisma.member.findFirst({
      where: {
        conversationId,
        userId: currentUser.id,
      },
    });

    if (!isMember) {
      throw new UnauthorizedException(
        'You are not a member of this conversation',
      );
    }

    const targetMessage = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyToMessage: {
          include: {
            senderUser: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!targetMessage) {
      throw new NotFoundException('Message not found');
    }

    const messagesBefore = await this.prisma.message.findMany({
      where: {
        conversationId,
        createdAt: {
          lt: targetMessage.createdAt,
        },
      },
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyToMessage: {
          include: {
            senderUser: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: before + 1,
    });

    const hasMoreMessagesBefore = messagesBefore.length > before;

    const messagesBeforeFinal = hasMoreMessagesBefore
      ? messagesBefore.slice(0, before)
      : messagesBefore;

    const messagesAfter = await this.prisma.message.findMany({
      where: {
        conversationId,
        createdAt: {
          gt: targetMessage.createdAt,
        },
      },
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyToMessage: {
          include: {
            senderUser: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: after + 1,
    });
    const hasMoreMessagesAfter = messagesAfter.length > after;
    const messagesAfterFinal = hasMoreMessagesAfter
      ? messagesAfter.slice(0, after)
      : messagesAfter;

    const context = [
      ...messagesBeforeFinal.reverse(),
      targetMessage,
      ...messagesAfterFinal,
    ];

    return {
      messages: context,
      targetMessageId: messageId,
      meta: {
        beforeCount: messagesBeforeFinal.length,
        afterCount: messagesAfterFinal.length,
        totalContext: context.length,
        hasMoreMessagesBefore,
        hasMoreMessagesAfter,
      },
    };
  }

  async createMessage(createMessageDto: CreateMessageDto, senderId: number) {
    const { conversationId, content, type, replyOf } = createMessageDto;

    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const isMember = await this.prisma.member.findFirst({
      where: {
        conversationId,
        userId: senderId,
      },
    });

    if (!isMember) {
      throw new Error('You are not a member of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        sender: senderId,
        content,
        type,
        replyOf,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        replyToMessage: {
          include: {
            senderUser: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return message;
  }

  async getUserConversations(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });

    return conversations;
  }

  async markMessageAsSeen(conversationId: number, userId: number) {
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId,
        sender: { not: userId },
        seenBy: { none: { userId } },
      },
    });

    await this.prisma.seen.createMany({
      data: unreadMessages.map((message) => ({
        messageId: message.id,
        userId,
      })),
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return {
      user,
      messages: unreadMessages,
    };
  }

  async deleteMessage(messageId: number) {
    const deletedMessage = await this.prisma.message.delete({
      where: { id: messageId },
    });

    return deletedMessage;
  }

  async toggleReaction(messageId: number, userId: number, reaction: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const persistedReaction = await this.prisma.messageReaction.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });

    let action: string = '';

    if (!persistedReaction) {
      await this.prisma.messageReaction.create({
        data: {
          messageId,
          userId,
          emoji: reaction,
        },
      });
      action = 'add_reaction';
    } else {
      if (persistedReaction.emoji === reaction) {
        await this.prisma.messageReaction.delete({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
        });
        action = 'remove_reaction';
      } else {
        await this.prisma.messageReaction.update({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
          data: {
            emoji: reaction,
          },
        });
        action = 'update_reaction';
      }
    }

    const updatedMessage = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return {
      action,
      message: updatedMessage,
    };
  }
}
