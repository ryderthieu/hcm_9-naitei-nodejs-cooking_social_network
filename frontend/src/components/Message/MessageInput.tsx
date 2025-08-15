import React from "react";
import { Send, Smile, Image, X } from "lucide-react";
import type { Member, Message } from "../../types/conversation.type";

interface MessageInputProps {
  newMessage: string;
  replyingTo: Message | null;
  user: Member | null;
  isShowIconPicker: boolean;
  setIsShowIconPicker: (show: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping?: (isTyping: boolean) => void;
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  replyingTo,
  user,
  isShowIconPicker,
  setIsShowIconPicker,
  fileInputRef,
  onChange,
  onSend,
  onTyping,
  onCancelReply,
}) => {
  return (
    <>
      {replyingTo && (
        <div className="px-4 py-2.5 bg-gray-100 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 mr-3 overflow-hidden">
            <div className="text-xs font-medium text-gray-700">
              Đang trả lời{" "}
              <span className="text-blue-600">
                {replyingTo.senderUser.id === user?.id
                  ? "chính bạn"
                  : `${replyingTo.senderUser.firstName} ${replyingTo.senderUser.lastName}`}
              </span>
            </div>
            <div className="text-sm text-gray-600 truncate mt-0.5">
              {replyingTo.content || "Tin nhắn"}
            </div>
          </div>
          <button
            onClick={() => {
              onCancelReply?.();
            }}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="p-3 flex items-center gap-2 bg-white border-t border-gray-200">
        <div className="flex-1 relative mb-2">
          <input
            value={newMessage}
            onChange={(e) => {
              onChange(e.target.value);
              onTyping?.(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
                onTyping?.(false);
              }
            }}
            onPaste={() => {
              onTyping?.(true);
            }}
            placeholder="Nhập tin nhắn..."
            className="w-full px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <button
              className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setIsShowIconPicker(!isShowIconPicker)}
            >
              <Smile size={20} />
            </button>
            {isShowIconPicker && (
              <div className="absolute z-50 top-[-450px] left-[-270px] h-[350px] w-auto">
                <div className="bg-white border rounded-lg p-4 shadow-lg">
                  Emoji Picker Placeholder
                </div>
              </div>
            )}
            <button
              className="text-gray-400 hover:text-blue-500 p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            onSend();
            onTyping?.(false);
          }}
          disabled={!newMessage.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors duration-150 flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </div>
    </>
  );
};
