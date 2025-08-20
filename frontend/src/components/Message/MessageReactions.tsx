import React, { useState, useRef } from "react";
import { Smile } from "lucide-react";
import type { MessageReaction } from "../../types/conversation.type";

interface MessageReactionsProps {
  reactions: MessageReaction[];
  messageId: number;
  conversationId: number;
  currentUserId: number | null;
  onReactionToggle: (
    messageId: number,
    conversationId: number,
    emoji: string
  ) => void;
  showOnlyTrigger?: boolean;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  messageId,
  conversationId,
  currentUserId,
  onReactionToggle,
  showOnlyTrigger = false,
}) => {
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const handleQuickReaction = (emoji: string) => {
    onReactionToggle(messageId, conversationId, emoji);
    setShowReactionBar(false);
  };

  const handleShowReactionBar = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      console.log("Button position:", {
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setShowReactionBar(!showReactionBar);
  };

  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some(
      (reaction) => reaction.userId === currentUserId
    );
  };

  const hasAnyReactions = reactions.length > 0;

  if (showOnlyTrigger) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleShowReactionBar}
          className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer ${
            showReactionBar
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          }`}
        >
          <Smile size={16} />
        </button>

        {showReactionBar && (
          <>
            <div
              className="fixed inset-0 bg-transparent"
              style={{ zIndex: 99998 }}
              onClick={() => {
                setShowReactionBar(false);
              }}
            />
            <div
              className="fixed bg-white rounded-full shadow-lg px-2 py-1 flex items-center space-x-1 animate-in slide-in-from-bottom-2 duration-200"
              style={{
                zIndex: 99999,
                transform: "translate(-50%, -100%)",
                left: `${buttonPosition.x}px`,
                top: `${buttonPosition.y - 10}px`,
              }}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleQuickReaction(emoji)}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 mt-1">
      {hasAnyReactions && (
        <div className="flex items-center space-x-1">
          {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
            const userReacted = hasUserReacted(emoji);

            return (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 ${
                  userReacted
                    ? "bg-blue-100 border border-blue-300 text-blue-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                title={reactionList
                  .map((r) => `${r.user.firstName} ${r.user.lastName}`)
                  .join(", ")}
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-xs font-medium">
                  {reactionList.length}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
