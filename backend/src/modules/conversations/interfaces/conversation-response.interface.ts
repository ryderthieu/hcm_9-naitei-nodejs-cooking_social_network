export interface ConversationMember {
  id: number;
  username: string;
  avatar: string | null;
}

export interface ConversationLastMessage {
  id: number;
  sender: {
    id: number;
    username: string;
    avatar: string | null;
  };
  content: string;
  type: string;
  createdAt: Date;
  isSeen: boolean;
}

export interface SingleConversationResponse {
  success: boolean;
  conversation: {
    id: number;
    name: string | null;
    avatar: string | null;
    createdAt: Date;
    members: ConversationMember[];
    lastMessage: ConversationLastMessage | null;
  };
  message?: string;
}

export interface ConversationListItem {
  id: number;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
}

export interface MultipleConversationsResponse {
  success: boolean;
  conversations: ConversationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
