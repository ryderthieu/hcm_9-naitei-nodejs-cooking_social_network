import React, { useState } from "react";
import type { MessageReaction } from "../../types/conversation.type";
import { ReactionModal } from "./ReactionModal";

interface ReactionSummaryProps {
  reactions: MessageReaction[];
  isMyMessage?: boolean;
}

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  reactions,
  isMyMessage = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!reactions || reactions.length === 0) {
    return null;
  }

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = 0;
    }
    acc[reaction.emoji]++;
    return acc;
  }, {} as Record<string, number>);

  const sortedEmojis = Object.entries(groupedReactions).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <>
      <div
        className={`absolute -bottom-2 z-10 ${
          isMyMessage ? "left-0" : "right-0"
        }`}
      >
        <div
          className="cursor-pointer group"
          onClick={() => setShowModal(true)}
        >
          <div className="flex items-center bg-white border border-gray-200 rounded-full px-1 py-0.5 shadow-sm group-hover:shadow-md transition-all duration-200 hover:scale-105 text-xs cursor-pointer">
            <span className="text-xs">{sortedEmojis[0][0]}</span>
            <span className="text-xs font-medium text-gray-600 ml-0.5">
              {reactions.length}
            </span>
          </div>
        </div>
      </div>

      <ReactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reactions={reactions}
      />
    </>
  );
};
