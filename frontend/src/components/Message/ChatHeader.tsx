import React from "react";
import { Phone, Video, Info } from "lucide-react";
import type { Conversation, Member } from "../../types/conversation.type";
import { GroupAvatar } from "./GroupAvatar";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

interface ChatHeaderProps {
  conversation: Conversation;
  showInfoSidebar: boolean;
  setShowInfoSidebar: (show: boolean) => void;
  currentUser?: Member | null;
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

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  showInfoSidebar,
  setShowInfoSidebar,
  currentUser,
  onlineUserIds = [],
}) => {
  const otherUser = conversation.members?.find(
    (member) => member.id !== currentUser?.id
  );
  const otherMembers = getOtherMembers(conversation, currentUser?.id);

  const isOnline = otherMembers.some((m) => onlineUserIds.includes(m.id));

  const displayName =
    conversation.name ||
    (otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Người dùng");

  return (
    <div className="px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative flex-shrink-0">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
                }}
              />
            ) : otherMembers.length > 0 ? (
              <GroupAvatar members={otherMembers} size={40} maxCount={2} />
            ) : (
              <img
                src={DEFAULT_AVATAR_URL}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-800 text-base">
              {displayName}
            </h2>
            <p
              className={`text-xs ${
                isOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isOnline ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-500">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-500">
            <Video size={20} />
          </button>
          <button
            onClick={() => setShowInfoSidebar(!showInfoSidebar)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-500"
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
