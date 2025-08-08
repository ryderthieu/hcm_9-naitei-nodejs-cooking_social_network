import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    conversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    member: {
      createMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    message: {
      count: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    const userId = 1;
    const createConversationDto = {
      members: [2, 3],
      name: 'Test Conversation',
    };

    it('should create a new conversation successfully', async () => {
      const allMembers = [1, 2, 3];
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        createdAt: new Date(),
        members: [
          {
            user: { id: 1, username: 'user_one', avatar: null }
          },
          {
            user: { id: 2, username: 'user_two', avatar: null }
          },
          {
            user: { id: 3, username: 'user_three', avatar: null }
          },
        ],
      };

      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 1 }, { id: 2 }, { id: 3 }
      ]);
      mockPrismaService.conversation.findFirst.mockResolvedValue(null);
      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.createConversation(userId, createConversationDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Conversation created successfully');
      expect(result.conversation).toBeDefined();
      expect(result.conversation.id).toBe(mockConversation.id);
    });

    it('should throw BadRequestException if some members do not exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 1 }, { id: 2 }
      ]);

      await expect(
        service.createConversation(userId, createConversationDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if conversation already exists for private chat', async () => {
      const existingConversation = {
        id: 1,
        name: '',
        members: [
          { user: { id: 1, username: 'user_one', avatar: null } },
          { user: { id: 2, username: 'user_two', avatar: null } },
        ],
      };

      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 2 }
      ]);
      mockPrismaService.conversation.findFirst.mockResolvedValue(existingConversation);

      await expect(
        service.createConversation(userId, { members: [2] })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getConversation', () => {
    const conversationId = 1;
    const userId = 1;

    it('should return conversation details successfully', async () => {
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        createdAt: new Date(),
        members: [
          { userId: 1, user: { id: 1, username: 'user_one', avatar: null } },
          { userId: 2, user: { id: 2, username: 'user_two', avatar: null } },
        ],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.message.findFirst.mockResolvedValue(null);

      const result = await service.getConversation(conversationId, userId);

      expect(result.success).toBe(true);
      expect(result.conversation.id).toBe(1);
      expect(result.conversation.name).toBe('Test Conversation');
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.getConversation(conversationId, userId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        members: [
          { userId: 2, user: { id: 2, username: 'user_two', avatar: null } },
          { userId: 3, user: { id: 3, username: 'user_three', avatar: null } },
        ],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.getConversation(conversationId, userId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUserConversations', () => {
    const userId = 1;
    const queryDto = { page: 1, limit: 10 };

    it('should return user conversations successfully', async () => {
      const mockConversations = [
        {
          id: 1,
          name: 'Test Conversation 1',
          avatar: null,
          createdAt: new Date(),
          members: [
            { user: { id: 1, username: 'user_one', avatar: null } },
            { user: { id: 2, username: 'user_two', avatar: null } },
          ],
          messages: [],
        },
      ];

      mockPrismaService.conversation.findMany.mockResolvedValue(mockConversations);
      mockPrismaService.conversation.count.mockResolvedValue(1);
      mockPrismaService.message.count.mockResolvedValue(0);

      const result = await service.getUserConversations(userId, queryDto);

      expect(result.success).toBe(true);
      expect(result.conversations).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('updateConversation', () => {
    const conversationId = 1;
    const userId = 1;
    const updateDto = { name: 'Updated Name', avatar: 'new-avatar.jpg' };

    it('should update conversation successfully', async () => {
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        members: [{ userId: 1 }],
      };

      const mockUpdatedConversation = {
        id: 1,
        name: 'Updated Name',
        avatar: 'new-avatar.jpg',
        createdAt: new Date(),
        members: [
          { user: { id: 1, username: 'user_one', avatar: null } },
        ],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.conversation.update.mockResolvedValue(mockUpdatedConversation);
      mockPrismaService.message.findFirst.mockResolvedValue(null);

      const result = await service.updateConversation(conversationId, userId, updateDto);

      expect(result.success).toBe(true);
      expect(result.conversation.name).toBe('Updated Name');
      expect(result.conversation.avatar).toBe('new-avatar.jpg');
      expect(result.message).toBe('Conversation updated successfully');
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.updateConversation(conversationId, userId, updateDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 2 }],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.updateConversation(conversationId, userId, updateDto)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteConversation', () => {
    const conversationId = 1;
    const userId = 1;

    it('should delete conversation successfully', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 1 }],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.message.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaService.conversation.delete.mockResolvedValue(mockConversation);

      const result = await service.deleteConversation(conversationId, userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Conversation and all messages deleted successfully');
      expect(mockPrismaService.message.deleteMany).toHaveBeenCalledWith({
        where: { conversationId: 1 }
      });
      expect(mockPrismaService.conversation.delete).toHaveBeenCalledWith({
        where: { id: conversationId }
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteConversation(conversationId, userId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 2 }],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.deleteConversation(conversationId, userId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addMembers', () => {
    const conversationId = 1;
    const userId = 1;
    const addMembersDto = { memberIds: [2, 3] };

    it('should add multiple members to conversation successfully', async () => {
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        members: [{ userId: 1 }],
      };

      const mockValidUsers = [
        { id: 2 },
        { id: 3 },
      ];

      const mockUpdatedConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        createdAt: new Date(),
        members: [
          { user: { id: 1, username: 'testuser', avatar: 'avatar.jpg' } },
          { user: { id: 2, username: 'newuser1', avatar: 'avatar2.jpg' } },
          { user: { id: 3, username: 'newuser2', avatar: 'avatar3.jpg' } },
        ],
      };

      mockPrismaService.conversation.findUnique
        .mockResolvedValueOnce(mockConversation)
        .mockResolvedValueOnce(mockUpdatedConversation);
      mockPrismaService.user.findMany.mockResolvedValue(mockValidUsers);
      mockPrismaService.member.createMany.mockResolvedValue({});

      const result = await service.addMembers(conversationId, userId, addMembersDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('2 member(s) added successfully');
      expect(result.conversation.members).toHaveLength(3);
      expect(mockPrismaService.member.createMany).toHaveBeenCalledWith({
        data: [
          { conversationId, userId: 2 },
          { conversationId, userId: 3 },
        ],
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.addMembers(conversationId, userId, addMembersDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 3 }], // different user
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.addMembers(conversationId, userId, addMembersDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if some users do not exist', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 1 }],
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.user.findMany.mockResolvedValue([{ id: 2 }]); // only one user found

      await expect(
        service.addMembers(conversationId, userId, addMembersDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if all users are already members', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 1 }, { userId: 2 }, { userId: 3 }], // all already members
      };

      const mockValidUsers = [
        { id: 2 },
        { id: 3 },
      ];

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.user.findMany.mockResolvedValue(mockValidUsers);

      await expect(
        service.addMembers(conversationId, userId, addMembersDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should only add new members (filter out existing ones)', async () => {
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        members: [{ userId: 1 }, { userId: 2 }], // user 2 already exists
      };

      const mockValidUsers = [
        { id: 2 },
        { id: 3 },
      ];

      const mockUpdatedConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        createdAt: new Date(),
        members: [
          { user: { id: 1, username: 'testuser', avatar: 'avatar.jpg' } },
          { user: { id: 2, username: 'existinguser', avatar: 'avatar2.jpg' } },
          { user: { id: 3, username: 'newuser', avatar: 'avatar3.jpg' } },
        ],
      };

      mockPrismaService.conversation.findUnique
        .mockResolvedValueOnce(mockConversation)
        .mockResolvedValueOnce(mockUpdatedConversation);
      mockPrismaService.user.findMany.mockResolvedValue(mockValidUsers);
      mockPrismaService.member.createMany.mockResolvedValue({});

      const result = await service.addMembers(conversationId, userId, addMembersDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('1 member(s) added successfully'); // only 1 new member
      expect(mockPrismaService.member.createMany).toHaveBeenCalledWith({
        data: [
          { conversationId, userId: 3 }, // only user 3 is new
        ],
      });
    });
  });

  describe('deleteMember', () => {
    const conversationId = 1;
    const userId = 1;
    const memberId = 2;

    it('should remove member from conversation successfully', async () => {
      const mockConversation = {
        id: 1,
        name: 'Test Conversation',
        members: [{ userId: 1 }, { userId: 2 }, { userId: 3 }], // 3 members
      };

      const mockUpdatedConversation = {
        id: 1,
        name: 'Test Conversation',
        avatar: null,
        createdAt: new Date(),
        members: [
          { user: { id: 1, username: 'user1', avatar: 'avatar1.jpg' } },
          { user: { id: 3, username: 'user3', avatar: 'avatar3.jpg' } },
        ],
      };

      mockPrismaService.conversation.findUnique
        .mockResolvedValueOnce(mockConversation)
        .mockResolvedValueOnce(mockUpdatedConversation);
      mockPrismaService.member.delete.mockResolvedValue({});
      mockPrismaService.member.count.mockResolvedValue(2); // remaining members

      const result = await service.deleteMember(conversationId, userId, memberId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Member removed successfully');
      expect(result.conversation?.members).toHaveLength(2);
      expect(mockPrismaService.member.delete).toHaveBeenCalledWith({
        where: { conversationId_userId: { conversationId, userId: memberId } },
      });
    });

    it('should delete conversation when no members remain', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 1 }], // only one member
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.member.delete.mockResolvedValue({});
      mockPrismaService.member.count.mockResolvedValue(0); // no remaining members
      mockPrismaService.message.deleteMany.mockResolvedValue({});
      mockPrismaService.conversation.delete.mockResolvedValue({});

      const result = await service.deleteMember(conversationId, userId, userId); // removing self

      expect(result.success).toBe(true);
      expect(result.message).toBe('Member removed and conversation deleted as no members remain');
      expect(mockPrismaService.conversation.delete).toHaveBeenCalledWith({
        where: { id: conversationId },
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteMember(conversationId, userId, memberId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 3 }], // different user
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.deleteMember(conversationId, userId, memberId)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if member to remove is not in conversation', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 1 }, { userId: 3 }], // memberId 2 not in conversation
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.deleteMember(conversationId, userId, memberId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to remove self from private conversation', async () => {
      const mockConversation = {
        id: 1,
        members: [{ userId: 1 }, { userId: 2 }], // exactly 2 members (private chat)
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await expect(
        service.deleteMember(conversationId, userId, userId) // removing self
      ).rejects.toThrow(BadRequestException);
    });
  });
});
