import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddMembersDto } from './dto/add-members.dto';
import {
  PAGE_DEFAULT,
  LIMIT_DEFAULT,
  PRIVATE_CHAT_MEMBERS,
  LAST_MESSAGE_LIMIT,
} from '../../common/constants/pagination.constants';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(
    userId: number,
    createConversationDto: CreateConversationDto,
  ) {
    const { members, name, avatar } = createConversationDto;

    const allMembers = Array.from(
      new Set([userId, ...members].filter((id) => id != null)),
    );

    const validMembers = await this.prisma.user.findMany({
      where: { id: { in: members } },
      select: { id: true },
    });

    if (validMembers.length !== members.length) {
      throw new BadRequestException('Some members do not exist');
    }

    if (allMembers.length === PRIVATE_CHAT_MEMBERS) {
      const existingConversation = await this.prisma.conversation.findFirst({
        where: {
          members: {
            every: {
              userId: { in: allMembers },
            },
          },
          AND: allMembers.map((memberId) => ({
            members: {
              some: { userId: memberId },
            },
          })),
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (
        existingConversation &&
        existingConversation.members.length === PRIVATE_CHAT_MEMBERS
      ) {
        throw new BadRequestException(
          'Conversation already exists between these users',
        );
      }
    }

    const newConversation = await this.prisma.conversation.create({
      data: {
        name: name || '',
        avatar: avatar || null,
        members: {
          createMany: {
            data: allMembers.map((memberId) => ({ userId: memberId })),
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const formattedMembers = newConversation.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    }));

    return {
      success: true,
      conversation: {
        id: newConversation.id,
        name: newConversation.name,
        avatar: newConversation.avatar,
        createdAt: newConversation.createdAt,
        members: formattedMembers,
        lastMessage: null,
      },
      message: 'Conversation created successfully',
    };
  }

  async getUserConversations(
    userId: number,
    queryDto: GetConversationsQueryDto,
  ) {
    const { page = PAGE_DEFAULT, limit = LIMIT_DEFAULT, search } = queryDto;
    const skip = (page - 1) * limit;

    let whereCondition: any = {
      members: {
        some: { userId },
      },
    };

    if (search && search.trim()) {
      whereCondition.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const conversations = await this.prisma.conversation.findMany({
      where: whereCondition,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: LAST_MESSAGE_LIMIT,
          include: {
            senderUser: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
            seenBy: {
              where: { userId },
              select: { userId: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = conv.messages[0] || null;

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            sender: { not: userId },
            seenBy: {
              none: { userId },
            },
          },
        });

        const formattedLastMessage = lastMessage
          ? {
              id: lastMessage.id,
              sender: {
                id: lastMessage.senderUser.id,
                username: lastMessage.senderUser.username,
                avatar: lastMessage.senderUser.avatar,
                firstName: lastMessage.senderUser.firstName,
                lastName: lastMessage.senderUser.lastName,
              },
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              isSeen: lastMessage.seenBy.length > 0,
            }
          : null;

        return {
          id: conv.id,
          name: conv.name,
          avatar: conv.avatar,
          members: conv.members.map((member) => ({
            id: member.user.id,
            username: member.user.username,
            avatar: member.user.avatar,
            firstName: member.user.firstName,
            lastName: member.user.lastName,
          })),
          createdAt: conv.createdAt,
          lastMessage: formattedLastMessage,
          unreadCount,
        };
      }),
    );

    const totalConversations = await this.prisma.conversation.count({
      where: whereCondition,
    });

    return {
      success: true,
      conversations: conversationsWithDetails,
      meta: {
        total: totalConversations,
        page: page,
        limit: limit,
      },
    };
  }

  async getConversation(conversationId: number, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isMember = conversation.members.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Access denied');
    }
    const [lastMessage, unreadCount] = await Promise.all([
      this.prisma.message.findFirst({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        include: {
          senderUser: {
            select: {
              id: true,
              username: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
          seenBy: {
            where: { userId },
            select: { userId: true },
          },
        },
      }),
      this.prisma.message.count({
        where: {
          conversationId: conversation.id,
          sender: { not: userId },
          seenBy: { none: { userId } },
        },
      }),
    ]);

    const formattedMembers = conversation.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    }));

    const formattedLastMessage = lastMessage
      ? {
          id: lastMessage.id,
          sender: {
            id: lastMessage.senderUser.id,
            username: lastMessage.senderUser.username,
            avatar: lastMessage.senderUser.avatar,
            firstName: lastMessage.senderUser.firstName,
            lastName: lastMessage.senderUser.lastName,
          },
          content: lastMessage.content,
          type: lastMessage.type,
          createdAt: lastMessage.createdAt,
          isSeen: lastMessage.seenBy.length > 0,
        }
      : null;

    return {
      success: true,
      conversation: {
        id: conversation.id,
        name: conversation.name,
        avatar: conversation.avatar,
        createdAt: conversation.createdAt,
        members: formattedMembers,
        lastMessage: formattedLastMessage,
        unreadCount,
      },
    };
  }

  async updateConversation(
    conversationId: number,
    userId: number,
    updateConversationDto: UpdateConversationDto,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isMember = conversation.members.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Permission denied');
    }

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        name: updateConversationDto.name ?? conversation.name,
        avatar: updateConversationDto.avatar ?? conversation.avatar,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const lastMessage = await this.prisma.message.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
        seenBy: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    const formattedMembers = updatedConversation.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
    }));

    const formattedLastMessage = lastMessage
      ? {
          id: lastMessage.id,
          sender: {
            id: lastMessage.senderUser.id,
            username: lastMessage.senderUser.username,
            avatar: lastMessage.senderUser.avatar,
            firstName: lastMessage.senderUser.firstName,
            lastName: lastMessage.senderUser.lastName,
          },
          content: lastMessage.content,
          type: lastMessage.type,
          createdAt: lastMessage.createdAt,
          isSeen: lastMessage.seenBy.length > 0,
        }
      : null;

    return {
      success: true,
      conversation: {
        id: updatedConversation.id,
        name: updatedConversation.name,
        avatar: updatedConversation.avatar,
        createdAt: updatedConversation.createdAt,
        members: formattedMembers,
        lastMessage: formattedLastMessage,
      },
      message: 'Conversation updated successfully',
    };
  }

  async deleteConversation(conversationId: number, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isMember = conversation.members.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'Permission denied to delete this conversation',
      );
    }

    await this.prisma.message.deleteMany({
      where: { conversationId: conversation.id },
    });

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return {
      success: true,
      message: 'Conversation and all messages deleted successfully',
    };
  }

  async addMembers(
    conversationId: number,
    userId: number,
    addMembersDto: AddMembersDto,
  ) {
    const { memberIds } = addMembersDto;

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isMember = conversation.members.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Permission denied');
    }

    const validUsers = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    });

    if (validUsers.length !== memberIds.length) {
      throw new BadRequestException('Some users do not exist');
    }

    const existingMemberIds = conversation.members.map(
      (member) => member.userId,
    );
    const newMemberIds = memberIds.filter(
      (id) => !existingMemberIds.includes(id),
    );

    if (newMemberIds.length === 0) {
      throw new BadRequestException(
        'All specified users are already members of this conversation',
      );
    }

    if (conversation.members.length === PRIVATE_CHAT_MEMBERS) {
      return await this.createConversation(userId, {
        members: [
          ...conversation.members.map((member) => member.userId),
          ...memberIds,
        ],
      });
    }

    await this.prisma.member.createMany({
      data: newMemberIds.map((memberId) => ({
        conversationId,
        userId: memberId,
      })),
    });

    const updatedConversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!updatedConversation) {
      throw new NotFoundException('Conversation not found after update');
    }

    const formattedMembers = updatedConversation.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    }));

    return {
      success: true,
      conversation: {
        id: updatedConversation.id,
        name: updatedConversation.name,
        avatar: updatedConversation.avatar,
        createdAt: updatedConversation.createdAt,
        members: formattedMembers,
      },
      message: `${newMemberIds.length} member(s) added successfully`,
    };
  }

  async deleteMember(conversationId: number, userId: number, memberId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isMember = conversation.members.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('Permission denied');
    }

    const memberToRemove = conversation.members.find(
      (member) => member.userId === memberId,
    );
    if (!memberToRemove) {
      throw new BadRequestException(
        'User is not a member of this conversation',
      );
    }

    if (
      conversation.members.length === PRIVATE_CHAT_MEMBERS &&
      userId === memberId
    ) {
      throw new BadRequestException(
        'Cannot remove yourself from a private conversation. Delete the conversation instead.',
      );
    }

    await this.prisma.member.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId: memberId,
        },
      },
    });

    const remainingMembers = await this.prisma.member.count({
      where: { conversationId },
    });

    if (remainingMembers === 0) {
      await this.prisma.message.deleteMany({
        where: { conversationId },
      });
      await this.prisma.conversation.delete({
        where: { id: conversationId },
      });

      return {
        success: true,
        message: 'Member removed and conversation deleted as no members remain',
      };
    }

    const updatedConversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!updatedConversation) {
      throw new NotFoundException('Conversation not found after update');
    }

    const formattedMembers = updatedConversation.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      avatar: member.user.avatar,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
    }));

    return {
      success: true,
      conversation: {
        id: updatedConversation.id,
        name: updatedConversation.name,
        avatar: updatedConversation.avatar,
        createdAt: updatedConversation.createdAt,
        members: formattedMembers,
      },
      message: 'Member removed successfully',
    };
  }
}
