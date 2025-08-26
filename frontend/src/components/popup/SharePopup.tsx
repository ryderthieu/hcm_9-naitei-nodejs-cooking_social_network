import { useState, useEffect, useCallback } from "react";
import { showErrorAlert, showSuccessAlert } from "../../utils/utils";
import { sharePost } from "../../services/post.service";
import { getConversations } from "../../services/conversation.service";
import { io } from "socket.io-client";
import { getAccessToken } from "../../services/api.service";
import type { Conversation, Member } from "../../types/conversation.type";
import { useAuth } from "../../contexts/AuthContext";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { GroupAvatar } from "../Message/GroupAvatar";
import AlertPopup from "./AlertPopup";
import { useAlertPopup } from "../../hooks";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  postCaption?: string;
  postId: number;
  image: string;
  onShareSuccess?: (sharesCount: number) => void;
}

export default function SharePopup({
  isOpen,
  onClose,
  postCaption = "",
  postId,
  image,
  onShareSuccess,
}: SharePopupProps) {
  const { alert, showError, showSuccess, closeAlert } = useAlertPopup();
  const [activeTab, setActiveTab] = useState<"social" | "messages">("social");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === "messages" && isOpen) {
      loadConversations();
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter((conversation) => {
      const displayName = getDisplayName(conversation).toLowerCase();
      if (displayName.includes(query)) return true;

      const memberNames = conversation.members
        .map((member) => `${member.firstName} ${member.lastName}`.toLowerCase())
        .join(" ");
      if (memberNames.includes(query)) return true;

      return false;
    });

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const getDisplayName = (conversation: Conversation): string => {
    const otherMembers = conversation.members.filter(
      (member) => member.id !== user?.id
    );
    return (
      conversation.name ||
      otherMembers.map((member) => member.firstName).join(", ")
    );
  };

  const getDisplayAvatar = (conversation: Conversation) => {
    const otherMembers = conversation.members.filter(
      (member) => member.id !== user?.id
    );

    if (conversation.avatar) {
      return (
        <img
          src={conversation.avatar}
          alt={getDisplayName(conversation)}
          className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-yellow-600 transition-all"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
          }}
        />
      );
    }

    if (otherMembers.length > 0) {
      return (
        <GroupAvatar members={conversation.members} size={48} maxCount={3} />
      );
    }

    return (
      <img
        src={DEFAULT_AVATAR_URL}
        alt={getDisplayName(conversation)}
        className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-yellow-600 transition-all"
      />
    );
  };

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await getConversations();
      const conversationsList = Array.isArray(response)
        ? response
        : response.conversations || [];
      setConversations(conversationsList);
      setFilteredConversations(conversationsList);
    } catch (error) {
      showErrorAlert(error, "Không thể tải danh sách cuộc trò chuyện");
      setConversations([]);
      setFilteredConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleShareToSocial = async (platform: string) => {
    if (sharing) return;
    setSharing(true);
    try {
      const response = await sharePost(postId);
      if (response.sharesCount !== undefined) {
        onShareSuccess?.(response.sharesCount);
      }
      onClose();

      const shareUrl = `${window.location.origin}/post/${postId}`;
      const shareText = `Xem bài viết này: ${
        postCaption ? postCaption.substring(0, 100) + "..." : "Bài viết mới"
      }`;

      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(shareText)}`,
            "_blank"
          );
          break;
        case "copy":
          navigator.clipboard.writeText(shareUrl);
          showSuccess("Đã sao chép link bài viết!");
          break;
      }
    } catch (e) {
      showError("Không thể chia sẻ bài viết. Vui lòng thử lại!");
    } finally {
      setSharing(false);
    }
  };

  const handleShareToConversation = async (conversationId: number) => {
    if (sharing) return;
    setSharing(true);
    try {
      const response = await sharePost(postId);
      if (response.sharesCount !== undefined) {
        onShareSuccess?.(response.sharesCount);
      }

      const messageContent = {
        id: postId,
        caption: postCaption,
        image: image,
      };

      const token = getAccessToken();
      if (!token) {
        throw new Error("Không có token xác thực");
      }

      const socket = io("http://localhost:3000/messages", {
        auth: { token },
      });

      await new Promise((resolve, reject) => {
        socket.on("connect", () => {
          const payload = {
            conversationId,
            content: JSON.stringify(messageContent),
            type: "POST" as any,
            replyOf: null as number | null,
          };

          socket.emit("send_message", payload, (response: any) => {
            if (response && response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });

        socket.on("connect_error", (error) => {
          reject(error);
        });

        setTimeout(() => {
          reject(new Error("Kết nối timeout"));
        }, 10000);
      });

      socket.disconnect();
      onClose();
      showSuccess("Đã chia sẻ bài viết qua tin nhắn!");
    } catch (e) {
      showError("Không thể chia sẻ bài viết. Vui lòng thử lại!");
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border border-yellow-600/10"
        style={{
          animation: "popup 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <button
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          Chia sẻ bài viết
        </h3>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("social")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === "social"
                ? "bg-white text-yellow-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Mạng xã hội
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === "messages"
                ? "bg-white text-yellow-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Tin nhắn
          </button>
        </div>

        {activeTab === "social" ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleShareToSocial("copy")}
              className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
            >
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span>Copy link</span>
            </button>

            <button
              onClick={() => handleShareToSocial("facebook")}
              className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
            >
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span>Chia sẻ Facebook</span>
            </button>

            <button
              onClick={() => handleShareToSocial("twitter")}
              className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
            >
              <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-5 h-5 text-sky-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.904 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </div>
              <span>Chia sẻ Twitter</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="relative mb-4">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:bg-white transition-all"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="text-center py-8 text-gray-500">
                  Đang tải cuộc trò chuyện...
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleShareToConversation(conversation.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0">
                      {getDisplayAvatar(conversation)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-800">
                        {getDisplayName(conversation)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {conversation.members?.length || 0} thành viên
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ))
              ) : searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy cuộc trò chuyện nào
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có cuộc trò chuyện nào
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <AlertPopup
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        showCancel={alert.showCancel}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onClose={closeAlert}
      />
    </div>
  );
}
