import React, { useState, useEffect } from "react";
import type { Conversation } from "../../types/conversation.type";
import { GroupAvatar } from "./GroupAvatar";

interface ConversationEditModalProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    conversationId: number,
    data: { name: string; avatar?: File }
  ) => Promise<void>;
  error?: string | null;
}

export const ConversationEditModal: React.FC<ConversationEditModalProps> = ({
  conversation,
  isOpen,
  onClose,
  onSave,
  error,
}) => {
  const [name, setName] = useState(conversation.name || "");
  const [avatar, setAvatar] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(
    conversation.avatar || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const isGroup = conversation.members?.length > 2;

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(conversation.id, { name, avatar });
    setIsLoading(false);
  };

  return (
    <div className="fixed flex justify-center items-center z-50 border-2 border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-white shadow-lg w-[400px] p-6">
        <h2 className="text-lg font-semibold mb-4">Cập nhật thông tin</h2>

        {isGroup && (
          <>
            <div className="flex flex-col items-center mb-4">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                ) : (
                  <GroupAvatar members={conversation.members} size={80} />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Tên cuộc trò chuyện
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên nhóm..."
              />
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {isLoading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};
