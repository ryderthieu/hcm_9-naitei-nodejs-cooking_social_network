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
});
