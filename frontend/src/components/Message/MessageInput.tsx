import React, { useState, useRef, useCallback } from "react";
import { Send, Smile, Image, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import type { Member, Message } from "../../types/conversation.type";

interface MessageInputProps {
  newMessage: string;
  replyingTo: Message | null;
  user: Member | null;
  isShowIconPicker: boolean;
  setIsShowIconPicker: (show: boolean) => void;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping?: (isTyping: boolean) => void;
  onCancelReply?: () => void;
  onEmojiSelect?: (emoji: string) => void;
  onFilesSelected?: (files: File[]) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  replyingTo,
  user,
  isShowIconPicker,
  setIsShowIconPicker,
  onChange,
  onSend,
  onTyping,
  onCancelReply,
  onEmojiSelect,
  onFilesSelected,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emojiData: any) => {
    if (onEmojiSelect) {
      onEmojiSelect(emojiData.emoji);
    }
    setIsShowIconPicker(false);
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          item.type.indexOf("image") !== -1 ||
          item.type.indexOf("video") !== -1
        ) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0 && onFilesSelected) {
        e.preventDefault();
        onFilesSelected(files);
      } else {
        onTyping?.(true);
      }
    },
    [onFilesSelected, onTyping]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setTimeout(() => {
        setDragActive(false);
      }, 100);

      const files = Array.from(e.dataTransfer.files);
      const mediaFiles = files.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      if (mediaFiles.length > 0 && onFilesSelected) {
        onFilesSelected(mediaFiles);
      }
    },
    [onFilesSelected]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const canSend = newMessage.trim();

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
        <div
          className={`flex-1 relative mb-2 transition-all duration-200 ${
            dragActive
              ? "ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]"
              : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
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
            onPaste={handlePaste}
            placeholder="Nhập tin nhắn..."
            className="w-full px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-24"
          />

          {dragActive && (
            <div className="absolute inset-0 bg-blue-50/80 border-2 border-dashed border-blue-400 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200">
              <div className="text-center text-blue-600">
                <Image size={24} className="mx-auto mb-1 animate-pulse" />
                <div className="text-sm font-medium">Thả file vào đây</div>
              </div>
            </div>
          )}

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <button
              className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setIsShowIconPicker(!isShowIconPicker)}
            >
              <Smile size={20} />
            </button>

            {isShowIconPicker && (
              <>
                <div
                  className="fixed inset-0 bg-transparent z-40"
                  onClick={() => setIsShowIconPicker(false)}
                />
                <div className="absolute z-50 bottom-full right-0 mb-2">
                  <div className="bg-white border rounded-lg shadow-2xl">
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      width={300}
                      height={400}
                      searchDisabled={false}
                      skinTonesDisabled={true}
                      previewConfig={{
                        showPreview: false,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              className="text-gray-400 hover:text-blue-500 p-2 rounded-full transition-colors hover:bg-gray-100"
              onClick={() => fileInputRef.current?.click()}
              title="Chọn file"
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
          disabled={!canSend}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors duration-150 flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
    </>
  );
};
