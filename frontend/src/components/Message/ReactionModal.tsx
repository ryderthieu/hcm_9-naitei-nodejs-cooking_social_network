import React, { useState } from "react";
import { X } from "lucide-react";
import type { MessageReaction } from "../../types/conversation.type";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: MessageReaction[];
}

export const ReactionModal: React.FC<ReactionModalProps> = ({
  isOpen,
  onClose,
  reactions,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  if (!isOpen) return null;

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const emojiEntries = Object.entries(groupedReactions).sort(
    ([, a], [, b]) => b.length - a.length
  );

  const getDisplayReactions = () => {
    if (activeTab === "all") {
      return reactions;
    }
    return groupedReactions[activeTab] || [];
  };

  const displayReactions = getDisplayReactions();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Cảm xúc về tin nhắn
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2  transition-colors cursor-pointer ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <span>Tất cả</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {reactions.length}
            </span>
          </button>

          {emojiEntries.map(([emoji, reactionList]) => (
            <button
              key={emoji}
              onClick={() => setActiveTab(emoji)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === emoji
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {reactionList.length}
              </span>
            </button>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto bg-white">
          {displayReactions.length > 0 ? (
            <div className="p-4 space-y-3">
              {displayReactions.map((reaction) => (
                <a
                  key={`${reaction.userId}-${reaction.emoji}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  href={`/${reaction.user.username}`}
                >
                  <img
                    src={reaction.user.avatar || DEFAULT_AVATAR_URL}
                    alt={`${reaction.user.firstName} ${reaction.user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {reaction.user.firstName} {reaction.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {reaction.user.username}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{reaction.emoji}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">😶</div>
              <div className="text-sm">Chưa có reactions nào</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
