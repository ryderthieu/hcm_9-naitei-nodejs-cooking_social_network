import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User, Gender } from '@prisma/client';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let service: ConversationsService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    gender: null,
    birthday: null,
    bio: null,
    slug: null,
    avatar: 'avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConversationsService = {
    createConversation: jest.fn(),
    getUserConversations: jest.fn(),
    getConversation: jest.fn(),
    updateConversation: jest.fn(),
    deleteConversation: jest.fn(),
    addMembers: jest.fn(),
    deleteMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ConversationsController>(ConversationsController);
    service = module.get<ConversationsService>(ConversationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const createConversationDto = {
        members: [2, 3],
        name: 'Test Conversation',
      };
      const expectedResult = {
        success: true,
        conversation: { id: 1, name: 'Test Conversation' },
        message: 'Conversation created successfully',
      };

      mockConversationsService.createConversation.mockResolvedValue(expectedResult);

      const result = await controller.create(mockUser, createConversationDto);

      expect(service.createConversation).toHaveBeenCalledWith(mockUser.id, createConversationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserConversations', () => {
    it('should get user conversations', async () => {
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = {
        success: true,
        conversations: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
        },
      };

      mockConversationsService.getUserConversations.mockResolvedValue(expectedResult);

      const result = await controller.getUserConversations(mockUser, queryDto);

      expect(service.getUserConversations).toHaveBeenCalledWith(mockUser.id, queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getConversation', () => {
    it('should get a specific conversation', async () => {
      const conversationId = 1;
      const expectedResult = {
        success: true,
        conversation: { 
          id: 1, 
          name: 'Test Conversation',
          avatar: null,
          createdAt: new Date(),
          members: [],
          lastMessage: null
        },
      };

      mockConversationsService.getConversation.mockResolvedValue(expectedResult);

      const result = await controller.getConversation(conversationId, mockUser);

      expect(service.getConversation).toHaveBeenCalledWith(conversationId, mockUser.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateConversation', () => {
    it('should update conversation', async () => {
      const conversationId = 1;
      const updateConversationDto = { name: 'Updated Name' };
      const expectedResult = {
        success: true,
        conversation: { 
          id: 1, 
          name: 'Updated Name',
          avatar: null,
          createdAt: new Date(),
          members: [],
          lastMessage: null
        },
        message: 'Conversation updated successfully',
      };

      mockConversationsService.updateConversation.mockResolvedValue(expectedResult);

      const result = await controller.updateConversation(
        conversationId,
        mockUser,
        updateConversationDto
      );

      expect(service.updateConversation).toHaveBeenCalledWith(
        conversationId,
        mockUser.id,
        updateConversationDto
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      const conversationId = 1;
      const expectedResult = {
        success: true,
        message: 'Conversation and all messages deleted successfully',
      };

      mockConversationsService.deleteConversation.mockResolvedValue(expectedResult);

      const result = await controller.deleteConversation(conversationId, mockUser);

      expect(service.deleteConversation).toHaveBeenCalledWith(conversationId, mockUser.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addMembers', () => {
    it('should add members to conversation successfully', async () => {
      const conversationId = 1;
      const addMembersDto = { memberIds: [2, 3] };
      const expectedResult = {
        success: true,
        conversation: {
          id: 1,
          name: 'Test Conversation',
          avatar: null,
          createdAt: new Date(),
          members: [
            { id: 1, username: 'testuser', avatar: 'avatar.jpg' },
            { id: 2, username: 'newuser', avatar: 'avatar2.jpg' },
            { id: 3, username: 'anotheruser', avatar: 'avatar3.jpg' },
          ],
        },
        message: '2 member(s) added successfully',
      };

      mockConversationsService.addMembers.mockResolvedValue(expectedResult);

      const result = await controller.addMembers(conversationId, mockUser, addMembersDto);

      expect(service.addMembers).toHaveBeenCalledWith(conversationId, mockUser.id, addMembersDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle conversation not found', async () => {
      const conversationId = 999;
      const addMembersDto = { memberIds: [2] };

      mockConversationsService.addMembers.mockRejectedValue(
        new Error('Conversation not found')
      );

      await expect(
        controller.addMembers(conversationId, mockUser, addMembersDto)
      ).rejects.toThrow('Conversation not found');

      expect(service.addMembers).toHaveBeenCalledWith(conversationId, mockUser.id, addMembersDto);
    });

    it('should handle permission denied', async () => {
      const conversationId = 1;
      const addMembersDto = { memberIds: [2] };

      mockConversationsService.addMembers.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(
        controller.addMembers(conversationId, mockUser, addMembersDto)
      ).rejects.toThrow('Permission denied');

      expect(service.addMembers).toHaveBeenCalledWith(conversationId, mockUser.id, addMembersDto);
    });

    it('should handle users already members', async () => {
      const conversationId = 1;
      const addMembersDto = { memberIds: [2] };

      mockConversationsService.addMembers.mockRejectedValue(
        new Error('All specified users are already members of this conversation')
      );

      await expect(
        controller.addMembers(conversationId, mockUser, addMembersDto)
      ).rejects.toThrow('All specified users are already members of this conversation');

      expect(service.addMembers).toHaveBeenCalledWith(conversationId, mockUser.id, addMembersDto);
    });

    it('should handle some users do not exist', async () => {
      const conversationId = 1;
      const addMembersDto = { memberIds: [999] };

      mockConversationsService.addMembers.mockRejectedValue(
        new Error('Some users do not exist')
      );

      await expect(
        controller.addMembers(conversationId, mockUser, addMembersDto)
      ).rejects.toThrow('Some users do not exist');

      expect(service.addMembers).toHaveBeenCalledWith(conversationId, mockUser.id, addMembersDto);
    });
  });

  describe('deleteMember', () => {
    it('should remove member from conversation successfully', async () => {
      const conversationId = 1;
      const memberId = 2;
      const expectedResult = {
        success: true,
        conversation: {
          id: 1,
          name: 'Test Conversation',
          avatar: null,
          createdAt: new Date(),
          members: [
            { id: 1, username: 'testuser', avatar: 'avatar.jpg' },
          ],
        },
        message: 'Member removed successfully',
      };

      mockConversationsService.deleteMember.mockResolvedValue(expectedResult);

      const result = await controller.deleteMember(conversationId, memberId, mockUser);

      expect(service.deleteMember).toHaveBeenCalledWith(conversationId, mockUser.id, memberId);
      expect(result).toEqual(expectedResult);
    });

    it('should delete conversation when no members remain', async () => {
      const conversationId = 1;
      const memberId = 1; // removing self as last member
      const expectedResult = {
        success: true,
        message: 'Member removed and conversation deleted as no members remain',
      };

      mockConversationsService.deleteMember.mockResolvedValue(expectedResult);

      const result = await controller.deleteMember(conversationId, memberId, mockUser);

      expect(service.deleteMember).toHaveBeenCalledWith(conversationId, mockUser.id, memberId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle conversation not found', async () => {
      const conversationId = 999;
      const memberId = 2;

      mockConversationsService.deleteMember.mockRejectedValue(
        new Error('Conversation not found')
      );

      await expect(
        controller.deleteMember(conversationId, memberId, mockUser)
      ).rejects.toThrow('Conversation not found');

      expect(service.deleteMember).toHaveBeenCalledWith(conversationId, mockUser.id, memberId);
    });

    it('should handle permission denied', async () => {
      const conversationId = 1;
      const memberId = 2;

      mockConversationsService.deleteMember.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(
        controller.deleteMember(conversationId, memberId, mockUser)
      ).rejects.toThrow('Permission denied');

      expect(service.deleteMember).toHaveBeenCalledWith(conversationId, mockUser.id, memberId);
    });

    it('should handle user not a member', async () => {
      const conversationId = 1;
      const memberId = 999;

      mockConversationsService.deleteMember.mockRejectedValue(
        new Error('User is not a member of this conversation')
      );

      await expect(
        controller.deleteMember(conversationId, memberId, mockUser)
      ).rejects.toThrow('User is not a member of this conversation');

      expect(service.deleteMember).toHaveBeenCalledWith(conversationId, mockUser.id, memberId);
    });

    it('should handle removing self from private conversation', async () => {
      const conversationId = 1;
      const memberId = 1; // removing self from private chat

      mockConversationsService.deleteMember.mockRejectedValue(
        new Error('Cannot remove yourself from a private conversation. Delete the conversation instead.')
      );

      await expect(
        controller.deleteMember(conversationId, memberId, mockUser)
      ).rejects.toThrow('Cannot remove yourself from a private conversation. Delete the conversation instead.');

      expect(service.deleteMember).toHaveBeenCalledWith(conversationId, mockUser.id, memberId);
    });
  });
});
