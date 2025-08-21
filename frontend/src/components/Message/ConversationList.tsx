import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import type { Conversation, Member } from "../../types/conversation.type";
import { GroupAvatar } from "./GroupAvatar";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { timeAgoVi } from "../../utils/timeUtils";

interface ConversationListProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  selectedConversationId: string | null;
  searchValue: string;
  setSearchValue: (value: string) => void;
  user?: Member | null;
  onConversationSelect: (conversationId: string) => void;
  onlineUserIds?: number[];
}

const getOtherMembers = (
  conversation: Conversation,
  currentUserId?: number
): Member[] => {
  return (
    conversation.members?.filter((member) => member.id !== currentUserId) || []
  );
};

export const ConversationList: React.FC<ConversationListProps> = ({
  filteredConversations,
  selectedConversationId,
  searchValue,
  setSearchValue,
  user,
  onConversationSelect,
  onlineUserIds = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Tin nhắn</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchValue
              ? "Không tìm thấy cuộc trò chuyện nào"
              : "Chưa có cuộc trò chuyện nào"}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherMembers = getOtherMembers(conversation, user?.id);

            const isOnline = otherMembers.some((m) =>
              onlineUserIds.includes(m.id)
            );

            const displayName =
              conversation.name ||
              (otherMembers.length === 1
                ? `${otherMembers[0].firstName} ${otherMembers[0].lastName}`
                : otherMembers.map((m) => m.firstName).join(", "));

            return (
              <div
                key={conversation.id}
                onClick={() => {
                  navigate(`/messages/${conversation.id}`);
                  onConversationSelect(conversation.id.toString());
                }}
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors duration-150 ${
                  selectedConversationId === conversation.id.toString()
                    ? "bg-blue-50 hover:bg-blue-100"
                    : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  {conversation.avatar ? (
                    <img
                      src={conversation.avatar}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
                      }}
                    />
                  ) : otherMembers.length > 0 ? (
                    <GroupAvatar
                      members={otherMembers}
                      size={48}
                      maxCount={3}
                    />
                  ) : (
                    <img
                      src={DEFAULT_AVATAR_URL}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0 relative">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {displayName}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {timeAgoVi(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {conversation.lastMessage?.content || "Chưa có tin nhắn"}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0 min-w-[20px] text-center">
                        {conversation.unreadCount > 99
                          ? "99+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
