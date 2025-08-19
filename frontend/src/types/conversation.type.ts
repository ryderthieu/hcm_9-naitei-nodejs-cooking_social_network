export interface Conversation {
  id: number;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  members: Member[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Member {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface MessageReaction {
  messageId: number;
  userId: number;
  emoji: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export type MessageType = "TEXT" | "MEDIA" | "POST" | "RECIPE";

export interface Message {
  id: number;
  conversationId: number;
  sender: number;
  content: string;
  replyOf: number | null;
  type: MessageType;
  createdAt: string;
  updatedAt: string;
  senderUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  replyToMessage: any | null;
  seenBy: Array<{
    messageId: number;
    userId: number;
    createdAt: string;
    user: {
      id: number;
      username: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  }>;
  reactions?: MessageReaction[];
}

export interface MessagesResponse {
  messages: Message[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
