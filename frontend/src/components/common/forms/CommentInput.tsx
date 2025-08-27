import { useRef, useEffect, useState } from "react";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import EmojiPicker from 'emoji-picker-react';
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonText?: string;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  avatarUrl?: string | null;
  showEmoji?: boolean;
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Viết bình luận...",
  buttonText = "Gửi",
  loading = false,
  disabled = false,
  autoFocus = false,
  className = "",
  avatarUrl = null,
  showEmoji = false,
}: CommentInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    onChange(value + emojiObject.emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <img
            src={DEFAULT_AVATAR_URL}
            alt="default avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        )}

        <div className="relative flex-1">
          <input
            ref={inputRef}
            className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled || loading}
          />
          {showEmoji && (
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-600 transition-colors"
              aria-label="Chọn emoji"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={!value.trim() || disabled || loading}
          className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Đang gửi..." : buttonText}
        </button>
      </div>

      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute top-full mt-2 right-0 z-50">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            width={250}
            height={300}
          />
        </div>
      )}
    </div>
  );
}
