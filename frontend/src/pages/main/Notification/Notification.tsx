import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../../services/notification.service";
import { Bell } from "lucide-react";
import { io, Socket } from "socket.io-client";
import {
  API_CONSTANTS,
  DEFAULT_AVATAR_URL,
} from "../../../constants/constants";
import { getAccessToken } from "../../../services/api.service";

type SenderUser = {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
};

type NotificationItem = {
  id: number;
  content: string | null;
  url?: string | null;
  isRead: boolean;
  createdAt: string;
  senderUser?: SenderUser | null;
};

const NotificationPage = () => {
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await getNotifications({ page, limit });
        const items = res.notifications || [];
        setNotifications(items);
        const totalPages = res.meta?.totalPages ?? 1;
        setHasMore(page < totalPages);
      } catch (error: any) {
        console.log(error?.message || "Lỗi tải thông báo");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [page, limit]);

  useEffect(() => {
    const apiBase = API_CONSTANTS.BASE_URL;
    const socketBase = apiBase.replace(/\/api$/, "");
    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${socketBase}/notifications`, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {});

    socket.on("new_notification", (payload: any) => {
      const notif = payload?.notification || payload;
      if (!notif) return;
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("new_notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const getNotificationContent = (notification: NotificationItem) => {
    const sender = notification.senderUser;
    const senderName = sender
      ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim() ||
        sender.username ||
        "Ai đó"
      : "Ai đó";
    return {
      name: senderName,
      text: notification.content || "Có thông báo mới",
    };
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setNotifications((prev: NotificationItem[]) =>
          prev.map((notif) =>
            notif.id === notification.id ? { ...notif, isRead: true } : notif
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const filtered = notifications.filter((n: NotificationItem) =>
    filter === "all" ? true : filter === "read" ? n.isRead : !n.isRead
  );

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-0 sm:p-4 ">
      <div className="mx-auto w-full max-w-7xl bg-white rounded-none sm:rounded-xl  border border-gray-200">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Thông báo
            </h2>
            <span className="text-xs sm:text-sm text-gray-500">
              ({filtered.length} mục)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-sm ${
                  filter === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 text-sm ${
                  filter === "unread"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Chưa đọc
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 text-sm ${
                  filter === "read"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Đã đọc
              </button>
            </div>
            {filtered.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>

        <div
          className="px-2 sm:px-4"
          style={
            filtered.length >= limit
              ? { maxHeight: "70vh", overflowY: "auto" }
              : { overflowY: "visible" }
          }
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Không có thông báo nào.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((notification) => {
                const content = getNotificationContent(notification);
                return (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex gap-3 sm:gap-4 items-start p-3 sm:p-4 cursor-pointer transition-colors ${
                      !notification.isRead
                        ? "bg-amber-50/60 hover:bg-amber-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={
                          notification.senderUser?.avatar || DEFAULT_AVATAR_URL
                        }
                        alt="avatar"
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-gray-100"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm sm:text-[15px] text-gray-800 ${
                          !notification.isRead ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {content.name && (
                          <span className="font-semibold text-gray-900">
                            {content.name + " "}
                          </span>
                        )}
                        <span className="text-gray-700">{content.text}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2 w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-500 hidden sm:block">
            Trang hiện tại: {page}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                page <= 1 || isLoading
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Mới hơn
            </button>
            <button
              disabled={!hasMore || isLoading}
              onClick={loadMore}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                !hasMore || isLoading
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cũ hơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
