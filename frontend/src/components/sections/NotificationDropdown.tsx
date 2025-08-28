import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../services/notification.service";
import { getAccessToken } from "../../services/api.service";
import { API_CONSTANTS, DEFAULT_AVATAR_URL } from "../../constants/constants";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

type NotificationItem = {
  id: number;
  content: string | null;
  url?: string | null;
  isRead: boolean;
  createdAt: string;
  senderUser?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    avatar?: string | null;
  } | null;
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotifications({ page: 1, limit: 10 });
        const items: NotificationItem[] = res.notifications || [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.isRead).length);
      } catch {}
    };
    load();

    const apiBase = API_CONSTANTS.BASE_URL;
    const socketBase = apiBase.replace(/\/api$/, "");
    const token = getAccessToken();
    if (token) {
      const socket = io(`${socketBase}/notifications`, {
        transports: ["websocket"],
        auth: { token },
      });
      socketRef.current = socket;
      socket.on("new_notification", (payload: any) => {
        const notif: NotificationItem = payload?.notification || payload;
        if (!notif) return;
        setNotifications((prev) => [notif, ...prev.slice(0, 9)]);
        setUnreadCount((c) => c + 1);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_notification");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setOpen(false);
      if (notification.url) {
        navigate(notification.url);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setOpen(false);
      if (notification.url) {
        navigate(notification.url);
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-left hover:cursor-pointer"
    >
      <button
        onClick={() => setOpen(!open)}
        className="group relative p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/80 hover:bg-white/90 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 hover:cursor-pointer"
      >
        <Bell
          className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors duration-200"
          strokeWidth={1.8}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 hover:cursor-pointer"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-[420px] bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-2xl shadow-gray-900/10 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-6 border-b border-gray-100/80">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                    Thông báo
                  </h3>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 rounded-full transition-all duration-200 hover:scale-105"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Không có thông báo nào
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Các thông báo mới sẽ hiển thị ở đây
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100/50">
                  {notifications.map((n, index) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full flex items-start gap-4 p-5 hover:bg-gray-50/80 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm hover:cursor-pointer ${
                        !n.isRead
                          ? "bg-gradient-to-r from-blue-50/50 to-purple-50/30 border-l-4 border-blue-400"
                          : "hover:translate-x-1"
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div
                        className={`relative flex-shrink-0 ${
                          !n.isRead
                            ? "ring-2 ring-blue-400/30 ring-offset-2 rounded-full"
                            : ""
                        }`}
                      >
                        <img
                          src={n.senderUser?.avatar || DEFAULT_AVATAR_URL}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover shadow-sm"
                        />
                        {!n.isRead && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm leading-relaxed">
                            <span
                              className={`font-semibold ${
                                !n.isRead ? "text-gray-900" : "text-gray-800"
                              }`}
                            >
                              {`${n.senderUser?.firstName || ""} ${
                                n.senderUser?.lastName || ""
                              }`.trim() ||
                                n.senderUser?.username ||
                                "Ai đó"}
                            </span>{" "}
                            <span className="text-gray-600 font-medium">
                              {n.content || "Có thông báo mới"}
                            </span>
                          </p>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100/80 bg-gray-50/30">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
                className="w-full py-3 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 hover:cursor-pointer"
              >
                Xem tất cả thông báo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
