import React, { useState } from "react";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { SeenByModal } from "./SeenByModal";

interface SeenByUser {
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
}

interface SeenByAvatarsProps {
  seenByToDisplay: SeenByUser[];
  seenBy: SeenByUser[];
  currentUserId: number | null;
  senderId: number;
}

export const SeenByAvatars: React.FC<SeenByAvatarsProps> = ({
  seenByToDisplay,
  seenBy,
  currentUserId,
  senderId,
}) => {
  const [showModal, setShowModal] = useState(false);

  const filteredSeenBy = seenByToDisplay.filter(
    (seen) => seen.userId !== senderId && seen.userId !== currentUserId
  );

  if (!filteredSeenBy || filteredSeenBy.length === 0) {
    return null;
  }

  const displayUsers = filteredSeenBy.slice(0, 3);
  const remainingCount = filteredSeenBy.length - 3;

  return (
    <>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center -space-x-1">
          {displayUsers.map((seen, index) => (
            <img
              key={seen.userId}
              src={seen.user.avatar || DEFAULT_AVATAR_URL}
              alt={`${seen.user.firstName} ${seen.user.lastName}`}
              className="w-4 h-4 rounded-full object-cover border border-white cursor-pointer hover:scale-110 transition-transform duration-200"
              style={{ zIndex: displayUsers.length - index }}
            />
          ))}

          {remainingCount > 0 && (
            <div
              className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-semibold cursor-pointer hover:scale-110 transition-transform duration-200"
              style={{ zIndex: 0 }}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>

      <SeenByModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        seenBy={seenBy}
      />
    </>
  );
};
