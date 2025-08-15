import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createConversation } from "../../services/conversation.service";
import { searchUsers, getFollowings } from "../../services/user.service";
import type { User } from "../../types/auth.type";
import type { Conversation } from "../../types/conversation.type";
import { useAuth } from "../../contexts/AuthContext";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

interface CreateConversationProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
}

export const CreateConversation: React.FC<CreateConversationProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [followings, setFollowings] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadFollowings();
      setError(null);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setError(null);
      const timeoutId = setTimeout(() => {
        searchUsersByName(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadFollowings = useCallback(async () => {
    if (!user?.username) return;

    try {
      const followingsData = await getFollowings(user.username);
      setFollowings(followingsData as User[]);
    } catch (error) {
      console.error("Failed to load followings:", error);
      setError("Không thể tải danh sách người theo dõi");
    }
  }, [user?.username]);

  const searchUsersByName = useCallback(async (query: string) => {
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search users:", error);
      setError("Không thể tìm kiếm người dùng");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleUserSelect = useCallback((selectedUser: User) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.find((u) => u.id === selectedUser.id);
      if (isAlreadySelected) {
        return prev.filter((u) => u.id !== selectedUser.id);
      } else {
        return [...prev, selectedUser];
      }
    });
  }, []);

  const handleCreateConversation = useCallback(async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const memberIds = selectedUsers.map((user) => user.id);
      const res = await createConversation({
        members: memberIds,
      });

      onCreated(res.conversation as Conversation);
      onClose();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setError("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUsers, onCreated, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const displayUsers = useMemo(() => {
    return searchQuery ? searchResults : followings;
  }, [searchQuery, searchResults, followings]);

  const renderUserItem = useCallback(
    (user: User, isSelected: boolean) => (
      <div
        key={user.id}
        className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors ${
          isSelected
            ? "bg-blue-100 border border-blue-300"
            : "hover:bg-gray-50 border border-transparent"
        }`}
        onClick={() => handleUserSelect(user)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleUserSelect(user);
          }
        }}
      >
        <img
          src={user.avatar || DEFAULT_AVATAR_URL}
          alt={`${user.username} avatar`}
          className="w-10 h-10 rounded-full object-cover mr-3"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username}
          </div>
          <div className="text-sm text-gray-500 truncate">@{user.username}</div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    ),
    [handleUserSelect]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-scroll"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="create-conversation-title"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2
              id="create-conversation-title"
              className="text-lg font-semibold text-gray-900"
            >
              Tạo cuộc trò chuyện mới
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Đóng"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Tìm kiếm người dùng"
            />
            {isSearching && (
              <div
                className="absolute right-3 top-2.5"
                aria-label="Đang tìm kiếm"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{user.username}</span>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="ml-2 text-blue-600 hover:text-blue-800 w-5 h-5 flex items-center justify-center"
                    aria-label={`Bỏ chọn ${user.username}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" style={{ maxHeight: "400px" }}>
          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {searchQuery
                ? `Kết quả tìm kiếm (${displayUsers.length})`
                : `Gợi ý từ người bạn follow (${displayUsers.length})`}
            </h3>
            {displayUsers.length > 0 ? (
              <div className="space-y-2 pr-2">
                {displayUsers.map((user) =>
                  renderUserItem(
                    user,
                    selectedUsers.some((u) => u.id === user.id)
                  )
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {isSearching
                  ? "Đang tìm kiếm..."
                  : searchQuery
                  ? "Không tìm thấy người dùng nào"
                  : "Bạn chưa follow ai"}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
                </span>
              ) : (
                "Tạo cuộc trò chuyện"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
