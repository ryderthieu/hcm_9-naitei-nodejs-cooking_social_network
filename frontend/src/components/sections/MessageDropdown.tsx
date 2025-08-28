import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_CONSTANTS, DEFAULT_AVATAR_URL } from "../../constants/constants";
import { GroupAvatar } from "../Message/GroupAvatar";
import { getAccessToken } from "../../services/api.service";
import { getConversations } from "../../services/conversation.service";
import { useAuth } from "../../contexts/AuthContext";
import { timeAgoVi } from "../../utils/timeUtils";

const MessageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c: any) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  const formatLastMessage = (c: any) => {
    const m = c.lastMessage;
    if (!m) return "";
    const isMe = user && Number(user.id) === Number(m.sender);
    const prefix = isMe
      ? "Bạn: "
      : m.senderUser
      ? `${m.senderUser.firstName || ""} ${
          m.senderUser.lastName || ""
        }`.trim() ||
        m.senderUser.username ||
        ""
      : "";
    let content = m.content || "";
    if (m.type === "MEDIA") content = "Đã gửi một media";
    if (m.type === "POST") content = "Đã chia sẻ một bài viết";
    if (m.type === "RECIPE") content = "Đã chia sẻ một công thức";
    if (m.type === "SYSTEM") content = m.content || "Tin nhắn hệ thống";
    return `${prefix ? prefix + (isMe ? "" : ": ") : ""}${content}`;
  };

  const getOtherMembers = (conversation: any) => {
    const members = Array.isArray(conversation?.members)
      ? conversation.members
      : [];
    if (!user?.id) return members;
    return members.filter((m: any) => m.id !== user.id);
  };

  const getDisplayName = (conversation: any) => {
    const otherMembers = getOtherMembers(conversation);
    if (conversation?.name) return conversation.name;
    if (otherMembers.length === 1) {
      const m = otherMembers[0];
      return (
        `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
        m.username ||
        "Cuộc trò chuyện"
      );
    }
    if (otherMembers.length > 1) {
      const names = otherMembers
        .map((m: any) => m.firstName || m.username || "")
        .filter(Boolean);
      return names.length ? names.join(", ") : "Cuộc trò chuyện";
    }
    return conversation?.members?.[0]?.username || "Cuộc trò chuyện";
  };

  const sortConversations = (list: any[]) => {
    return [...list].sort((a: any, b: any) => {
      const aTime = a?.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b?.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await getConversations();
        const items = Array.isArray(res.conversations) ? res.conversations : [];
        setConversations(sortConversations(items));
      } catch (e: any) {
        setError(e?.message || "Lỗi tải hội thoại");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const apiBase = API_CONSTANTS.BASE_URL;
    const socketBase = apiBase.replace(/\/api$/, "");
    const token = getAccessToken();
    if (token) {
      const socket = io(`${socketBase}/messages`, {
        transports: ["websocket"],
        auth: { token },
      });
      socketRef.current = socket;
      socket.on("new_message", (payload: any) => {
        const msg = payload?.message || payload;
        if (!msg) return;

        setConversations((prev) => {
          const next = [...prev];
          const idx = next.findIndex((c: any) => c.id === msg.conversationId);
          if (idx >= 0) {
            const conv = next[idx];
            const isOwnMessage = Number(msg.sender) === Number(user?.id);

            let newUnreadCount;
            if (isOwnMessage) {
              newUnreadCount = 0;
            } else {
              newUnreadCount = (conv.unreadCount || 0) + 1;
            }

            next[idx] = {
              ...conv,
              lastMessage: msg,
              unreadCount: newUnreadCount,
            };
          } else {
            const isOwnMessage = Number(msg.sender) === Number(user?.id);
            const initialUnreadCount = isOwnMessage ? 0 : 1;

            next.unshift({
              id: msg.conversationId,
              name: null,
              avatar: null,
              members: [],
              lastMessage: msg,
              unreadCount: initialUnreadCount,
            });
          }
          return sortConversations(next);
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/80 hover:bg-white/90 rounded-2xl transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 hover:cursor-pointer"
      >
        <MessageCircleMore
          className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors duration-200"
          strokeWidth={1.8}
        />
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg animate-pulse">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 hover:cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 w-[420px] bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-2xl shadow-gray-900/10 z-50 mt-2 animate-in slide-in-from-top-2 duration-200">
            <div className="p-6 border-b border-gray-100/80">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Tin nhắn
                </h3>
                {unreadTotal > 0 && (
                  <span className="ml-auto px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-red-700 text-xs font-semibold rounded-full">
                    {unreadTotal} mới
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">
                    Đang tải tin nhắn...
                  </p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center">
                    <MessageCircleMore
                      className="w-8 h-8 text-red-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : !Array.isArray(conversations) ||
                conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <MessageCircleMore
                      className="w-8 h-8 text-gray-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Chưa có cuộc trò chuyện nào
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Bắt đầu trò chuyện với bạn bè
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100/50">
                  {conversations.map((c: any, index) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        navigate(`/messages/${c.id}`);
                        setIsOpen(false);
                      }}
                      className="w-full text-left p-5 hover:bg-gray-50/80 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group hover:cursor-pointer"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          {c.avatar ? (
                            <img
                              src={c.avatar}
                              alt={getDisplayName(c)}
                              className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  DEFAULT_AVATAR_URL;
                              }}
                            />
                          ) : getOtherMembers(c).length > 0 ? (
                            <GroupAvatar
                              members={getOtherMembers(c)}
                              size={48}
                              maxCount={3}
                            />
                          ) : (
                            <img
                              src={DEFAULT_AVATAR_URL}
                              alt={getDisplayName(c)}
                              className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all duration-200"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`flex items-start justify-between gap-2 ${
                              c.unreadCount > 0 ? "mb-0" : "mb-1"
                            }`}
                          >
                            <h4
                              className={`text-sm font-semibold truncate ${
                                c.unreadCount > 0
                                  ? "text-gray-900"
                                  : "text-gray-800"
                              }`}
                            >
                              {getDisplayName(c)}
                            </h4>
                            {(c.lastMessage?.createdAt ||
                              c.unreadCount > 0) && (
                              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                {c.lastMessage?.createdAt && (
                                  <span className="text-xs text-gray-500 leading-none">
                                    {timeAgoVi(c.lastMessage?.createdAt)}
                                  </span>
                                )}
                                {c.unreadCount > 0 && (
                                  <span className="bg-blue-500 text-white text-[10px] rounded-full px-2 py-0.5 leading-none min-w-[20px] text-center">
                                    {c.unreadCount > 99 ? "99+" : c.unreadCount}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <p
                            className={`text-sm truncate ${
                              c.unreadCount > 0
                                ? "text-gray-700 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {formatLastMessage(c) || "Chưa có tin nhắn"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100/80 bg-gray-50/30">
              <button
                onClick={() => {
                  navigate("/messages");
                  setIsOpen(false);
                }}
                className="w-full py-3 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 hover:cursor-pointer"
              >
                Xem tất cả tin nhắn
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageDropdown;
