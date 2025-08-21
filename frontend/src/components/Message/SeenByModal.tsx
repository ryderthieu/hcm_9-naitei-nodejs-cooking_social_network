import React from "react";
import { X } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

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

interface SeenByModalProps {
  isOpen: boolean;
  onClose: () => void;
  seenBy: SeenByUser[];
}

export const SeenByModal: React.FC<SeenByModalProps> = ({
  isOpen,
  onClose,
  seenBy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Đã xem ({seenBy.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto bg-white">
          {seenBy.length > 0 ? (
            <div className="p-4 space-y-3">
              {seenBy.map((seen) => (
                <div
                  key={`${seen.userId}-${seen.messageId}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <img
                    src={seen.user.avatar || DEFAULT_AVATAR_URL}
                    alt={`${seen.user.firstName} ${seen.user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {seen.user.firstName} {seen.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Đã xem lúc{" "}
                      {new Date(seen.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">👁️</div>
              <div className="text-sm">Chưa có ai xem tin nhắn này</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
