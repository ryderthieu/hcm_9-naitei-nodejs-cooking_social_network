import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";

const MessageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full border border-gray-600 hover:border-gray-700 focus:outline-none transition-colors duration-200"
      >
        <MessageCircleMore
          className="w-6 h-6 text-gray-600"
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 mt-7">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-gray-800">
                Tin nhắn
              </h3>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Đang tải tin nhắn...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : !Array.isArray(conversations) || conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              conversations.map((conversation) => (
                <div>
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={"/placeholder.svg"}
                        alt={"User avatar"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p>Người dùng</p>
                      </div>
                      <p className={`text-sm text-gray-600 truncate mt-1 `}></p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-100 w-full text-center">
            <button
              onClick={() => {
                navigate("/messages");
                setIsOpen(false);
              }}
              className="text-sm text-[#FF6363] font-semibold hover:text-[#fa5555] py-2 rounded transition-colors"
            >
              Xem tất cả tin nhắn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;
