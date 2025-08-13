import { Bell, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import { useState, useRef, type JSX } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  interface Notification {
    _id: string;
    type: "like" | "comment" | "share" | "follow" | string;
    isRead: boolean;
    sender?: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    postId?: string;
    videoId?: string;
    message?: string;
    createdAt: string;
  }

  type NotificationType = Notification["type"];

  const getNotificationIcon = (type: NotificationType): JSX.Element => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "share":
        return <Share2 className="w-5 h-5 text-green-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 border border-gray-600 hover:border-gray-700 transition-colors duration-200"
      >
        <Bell className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-7 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-4 border-b border-gray-100 font-semibold text-gray-800 flex justify-between items-center">
            <span className="text-[16px]">Thông báo</span>
            {unreadCount > 0 && (
              <button className="text-sm text-blue-500 hover:text-blue-600">
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification) => (
                <div>
                  <img
                    src={"https://via.placeholder.com/150"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="text-xs text-gray-400"></p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 text-center border-t">
            <button
              onClick={() => {
                navigate("/notification");
                setOpen(false);
              }}
              className="text-sm text-[#FF6363] font-semibold hover:text-[#fa5555]"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
