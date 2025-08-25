import type { Conversation } from "../../types/conversation.type";
import { GroupAvatar } from "./GroupAvatar";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { useAuth } from "../../contexts/AuthContext";
import { Edit, FileText, Image, LogOut, Search, User } from "lucide-react";

interface InfoSidebarProps {
  conversation: Conversation;
  onEditConversation: () => void;
  onClickMembers: () => void;
  onClickSearch: () => void;
  onClickMedia: () => void;
  onClickLink: () => void;
  onClickLeave: () => void;
}

export const InfoSidebar: React.FC<InfoSidebarProps> = ({
  conversation,
  onEditConversation,
  onClickMembers,
  onClickSearch,
  onClickMedia,
  onClickLink,
  onClickLeave,
}) => {
  const { user } = useAuth();
  const otherMembers = conversation.members.filter(
    (member) => member.id !== user?.id
  );

  const displayName =
    conversation.name ||
    otherMembers.map((member) => member.firstName).join(", ");

  return (
    <div className="flex flex-col h-full">
      <div className=" flex-2 items-center flex justify-center ">
        <div className="flex justify-center items-center flex-col gap-1 flex-1 ">
          <div className="rounded-full">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
                }}
              />
            ) : otherMembers.length > 0 ? (
              <GroupAvatar
                members={conversation.members}
                size={96}
                maxCount={3}
              />
            ) : (
              <img
                src={DEFAULT_AVATAR_URL}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
          </div>
          <div className="flex items-center gap-2 max-w-[70%]">
            <p className="text-lg font-semibold truncate">{displayName}</p>
            <Edit
              size={16}
              className="hover:cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => {
                onEditConversation();
              }}
            />
          </div>
        </div>
      </div>
      <hr className="w-full text-gray-200" />
      <div className="flex flex-col gap-2 flex-5 ">
        <div className="p-4 space-y-2">
          <button
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            onClick={onClickMembers}
          >
            <User size={20} className="text-gray-600" />
            <span className="text-gray-700">Thành viên</span>
          </button>
          <button
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            onClick={onClickSearch}
          >
            <Search size={20} className="text-gray-600" />
            <span className="text-gray-700">Tìm kiếm tin nhắn</span>
          </button>
          <button
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            onClick={onClickMedia}
          >
            <Image size={20} className="text-gray-600" />
            <span className="text-gray-700">File phương tiện</span>
          </button>
          <button
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            onClick={onClickLink}
          >
            <FileText size={20} className="text-gray-600" />
            <span className="text-gray-700">Liên kết</span>
          </button>
          {conversation.members.length > 2 && (
            <button
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
              onClick={onClickLeave}
            >
              <LogOut size={20} className="text-red-500" />
              <span className="text-red-500">Rời khỏi cuộc trò chuyện</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
