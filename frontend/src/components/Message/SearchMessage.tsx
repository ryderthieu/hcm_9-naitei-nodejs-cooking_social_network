import { Search, X, MessageCircle } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Conversation } from "../../types/conversation.type";
import { MdOutlineNavigateBefore } from "react-icons/md";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  replyToMessage?: Message;
  reactions: any[];
  seenBy: any[];
}

interface SearchResult {
  messages: Message[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchInfo: {
    query: string;
    hasSearch: boolean;
  };
}

interface SearchMessageProps {
  onSearch: (searchText: string, page?: number) => Promise<SearchResult>;
  onShowContext: (messageId: number) => void;
  onClose: () => void;
  conversation: Conversation;
}

export const SearchMessage: React.FC<SearchMessageProps> = ({
  onSearch,
  onShowContext,
  onClose,
}) => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (query: string, page: number = 1) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        if (!query.trim()) {
          setSearchResults(null);
          return;
        }

        setIsSearching(true);
        try {
          const result = await onSearch(query, page);
          let formattedResult = {
            ...result,
            messages: result.messages.reverse(),
          };
          setSearchResults(formattedResult);
          setCurrentPage(page);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults(null);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [onSearch]
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
    debouncedSearch(value, 1);
  };

  const handleSearchResultClick = async (message: Message) => {
    setIsLoadingContext(true);
    try {
      onShowContext(message.id);
    } catch (error) {
      console.error("Context loading error:", error);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchText.trim()) {
      debouncedSearch(searchText, page);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.trim()})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const handleClose = () => {
    setSearchText("");
    setSearchResults(null);
    setCurrentPage(1);
    onClose();
  };

  return (
    <div className="pt-4 flex flex-1 flex-col gap-4">
      <div className="flex items-center flex-1 mx-4">
        <MdOutlineNavigateBefore
          size={24}
          className="cursor-pointer"
          onClick={handleClose}
        />
        <h2 className="text-lg font-semibold text-center flex-1">
          Tìm kiếm tin nhắn
        </h2>
      </div>

      <hr className="text-gray-200" />

      <div className="mx-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm tin nhắn..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
        {searchText && (
          <button
            onClick={() => {
              setSearchText("");
              setSearchResults(null);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-scroll p-2 max-h-[calc(100vh-200px)]">
        {isSearching ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-500">Đang tìm kiếm...</p>
          </div>
        ) : searchResults && searchResults.messages.length > 0 ? (
          <>
            <div className="mb-4 px-2">
              <p className="text-sm text-gray-600">
                Tìm thấy {searchResults.meta.totalMessages} tin nhắn
              </p>
            </div>

            <div className="space-y-2">
              {searchResults.messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSearchResultClick(message)}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors relative"
                >
                  {isLoadingContext && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <img
                      src={message.senderUser.avatar || DEFAULT_AVATAR_URL}
                      alt={`${message.senderUser.firstName} ${message.senderUser.lastName}`}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {message.senderUser.firstName}{" "}
                        {message.senderUser.lastName}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {highlightText(
                          message.content,
                          searchResults?.searchInfo?.query || ""
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(
                          new Date(message.createdAt),
                          "HH:mm dd/MM/yyyy",
                          {
                            locale: vi,
                          }
                        )}
                      </p>
                    </div>
                    <MessageCircle
                      size={16}
                      className="text-gray-400 flex-shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>

            {searchResults.meta.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!searchResults.meta.hasPrevPage}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>

                <span className="px-3 py-1 text-sm text-gray-600">
                  {currentPage} / {searchResults.meta.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!searchResults.meta.hasNextPage}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : searchResults && searchResults.messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search size={40} className="mx-auto mb-3 text-gray-400" />
            <p>Không tìm thấy kết quả nào</p>
            <p className="text-sm mt-1">Thử từ khóa khác</p>
          </div>
        ) : !searchText ? (
          <div className="text-center py-8 text-gray-500">
            <Search size={40} className="mx-auto mb-3 text-gray-400" />
            <p>Nhập từ khóa để tìm kiếm tin nhắn</p>
            <p className="text-sm mt-1">
              Tìm kiếm nội dung tin nhắn trong cuộc trò chuyện
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
