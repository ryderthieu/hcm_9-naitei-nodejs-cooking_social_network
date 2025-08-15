import React from "react";
import { Send } from "lucide-react";

interface NewMessageNotificationProps {
  hasNewMessage: boolean;
  onNewMessageClick: () => void;
}

export const NewMessageNotification: React.FC<NewMessageNotificationProps> = ({
  hasNewMessage,
  onNewMessageClick,
}) => {
  if (!hasNewMessage) return null;

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
      <button
        onClick={onNewMessageClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-200 animate-bounce"
      >
        <span>Tin nhắn mới</span>
        <Send size={16} className="transform rotate-90" />
      </button>
    </div>
  );
};
