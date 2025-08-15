import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Info, MessageSquareText, Reply, Trash2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_CONSTANTS } from "../../../constants/constants";

import {
  ConversationList,
  ChatHeader,
  MessageInput,
  EmptyState,
  NewMessageNotification,
  Tooltip,
} from "../../../components/Message";
import type {
  Conversation,
  Member,
  Message,
  MessagesResponse,
} from "../../../types/conversation.type";
import type { User } from "../../../types/auth.type";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";
import {
  getConversations,
  getConversation,
} from "../../../services/conversation.service";
import { useAuth } from "../../../contexts/AuthContext";
import { getMessages } from "../../../services/message.service";
import { DeleteConfirm } from "../../../components/popup";

const convertUserToMember = (user: User): Member => ({
  id: user.id,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar || DEFAULT_AVATAR_URL,
});

const getSenderAsMember = (message: Message): Member => {
  return {
    id: message.senderUser.id,
    username: message.senderUser.username,
    firstName: message.senderUser.firstName,
    lastName: message.senderUser.lastName,
    avatar: message.senderUser.avatar || DEFAULT_AVATAR_URL,
  };
};

export default function MessagePage() {
  const navigate = useNavigate();

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationUpdateTimeoutRef = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [isShowIconPicker, setIsShowIconPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [typingByConversation, setTypingByConversation] = useState<
    Record<number, number[]>
  >({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{
    id: number;
    conversationId: number;
    content: string;
  } | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, loading: isAuthLoading } = useAuth();

  const currentUserAsMember: Member | null = user
    ? convertUserToMember(user)
    : null;

  const filteredConversations = Array.isArray(conversations)
    ? conversations
        .filter((conversation: Conversation) => {
          const otherUser = conversation.members?.find?.(
            (member: Member) => member.id !== user?.id
          );
          return (
            otherUser?.firstName
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase()) ||
            otherUser?.lastName
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase())
          );
        })
        .sort((a: Conversation, b: Conversation) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return (
            new Date(b.lastMessage.createdAt).getTime() -
            new Date(a.lastMessage.createdAt).getTime()
          );
        })
    : [];

  const selectedConversation =
    Array.isArray(conversations) && selectedConversationId
      ? conversations.find(
          (c: Conversation) => String(c.id) === selectedConversationId
        ) || null
      : null;

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await getConversations();

      if (response.success && response.conversations) {
        setConversations(response.conversations);
      } else {
        setError("Dữ liệu cuộc trò chuyện không hợp lệ");
      }
    } catch (error) {
      setError("Lỗi khi tải cuộc trò chuyện");
    } finally {
      setIsLoading(false);
    }
  };

  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [limit] = useState<number>(20);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      setMessagesError(null);

      const response: MessagesResponse = await getMessages(
        Number(conversationId),
        {
          page: 1,
          limit,
        }
      );

      if (response && Array.isArray(response.messages)) {
        const transformedMessages = response.messages;

        setMessages(transformedMessages);

        setPage(response.meta?.currentPage || 1);
        setHasNextPage(!!response.meta?.hasNextPage);

        setTimeout(() => {
          if (messagesEndRef.current) {
            isProgrammaticScrollRef.current = true;
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            isAtBottomRef.current = true;
            setTimeout(() => (isProgrammaticScrollRef.current = false), 120);
          }
        }, 0);
      } else {
        setMessagesError("Dữ liệu tin nhắn không hợp lệ");
        setMessages([]);
      }
    } catch (error) {
      setMessagesError("Lỗi khi tải tin nhắn");
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversationId || !hasNextPage || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const container = messageContainerRef.current;
      if (container) {
        prevScrollHeightRef.current = container.scrollHeight;
        prevScrollTopRef.current = container.scrollTop;
      }
      const nextPage = page + 1;
      const response: MessagesResponse = await getMessages(
        Number(selectedConversationId),
        { page: nextPage, limit }
      );
      if (response && Array.isArray(response.messages)) {
        setMessages((prev) => [...response.messages, ...prev]);
        setPage(response.meta?.currentPage || nextPage);
        setHasNextPage(!!response.meta?.hasNextPage);
        setTimeout(() => {
          const c = messageContainerRef.current;
          if (!c) return;
          const delta = c.scrollHeight - prevScrollHeightRef.current;
          c.scrollTop = prevScrollTopRef.current + delta;
        }, 0);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleNewMessageClick = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setHasNewMessage(false);
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const { conversationId } = useParams<{ conversationId: string }>();

  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    } else {
      setSelectedConversationId(null);
    }
  }, [conversationId]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const foundConversation = conversations.find(
        (c) => c?.id?.toString() === conversationId
      );
      if (foundConversation) {
        setSelectedConversationId(conversationId);
      } else {
        navigate("/messages");
      }
    }
  }, [conversationId, conversations, navigate]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    } else {
      setMessages([]);
      setMessagesError(null);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      isAtBottomRef.current = distanceFromBottom < 80;
      lastScrollTopRef.current = scrollTop;
      if (scrollTop <= 80) {
        loadOlderMessages();
      }
    };
    container.addEventListener("scroll", handleScroll);
    isAtBottomRef.current = true;
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const socket = io(
      `${API_CONSTANTS.BASE_URL.replace("/api", "")}/messages`,
      {
        auth: { token },
        transports: ["websocket"],
      }
    );

    socketRef.current = socket;

    socket.on("user_online", ({ userId }: { userId: number }) => {
      setOnlineUserIds((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });
    socket.on("user_offline", ({ userId }: { userId: number }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
    });

    socket.on(
      "typing",
      ({
        userId,
        isTyping,
        conversationId,
      }: {
        userId: number;
        isTyping: boolean;
        conversationId: number;
      }) => {
        if (!conversationId) return;
        if (userId === user?.id) return;
        setTypingByConversation((prev) => {
          const current = prev[conversationId] || [];
          const nextUsers = isTyping
            ? Array.from(new Set([...current, userId]))
            : current.filter((id) => id !== userId);
          return { ...prev, [conversationId]: nextUsers };
        });
      }
    );

    socket.on("new_message", (message: Message) => {
      if (
        selectedConversationId &&
        message.conversationId.toString() === selectedConversationId
      ) {
        setMessages((prev) => [...prev, message]);

        if (message.senderUser.id !== user.id) {
          socket.emit("mark_as_seen", {
            conversationId: message.conversationId,
          });
        }

        if (isAtBottomRef.current || message.senderUser.id === user.id) {
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }, 0);
        } else {
          setHasNewMessage(true);
        }
      }

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === message.conversationId);
        if (idx === -1) return prev;
        const updated = [...prev];
        const conv = { ...updated[idx] };

        if (
          (!selectedConversationId ||
            selectedConversationId !== String(message.conversationId)) &&
          message.senderUser.id !== user.id
        ) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        updated[idx] = conv;
        return updated;
      });
    });

    socket.on("message_deleted", (deleted) => {
      setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
    });

    socket.on(
      "message_seen",
      ({
        conversationId,
        userId,
      }: {
        conversationId: number;
        userId: number;
      }) => {
        if (
          selectedConversationId &&
          String(conversationId) === selectedConversationId
        ) {
          setMessages((prev) =>
            prev.map((m) => {
              const exists = m.seenBy?.some((s) => s.userId === userId);
              if (exists) return m;
              return {
                ...m,
                seenBy: [
                  ...(m.seenBy || []),
                  {
                    messageId: m.id,
                    userId,
                    createdAt: new Date().toISOString(),
                    user: {
                      id: userId,
                      username: "",
                      firstName: "",
                      lastName: "",
                      avatar: DEFAULT_AVATAR_URL,
                    },
                  },
                ],
              };
            })
          );
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    );

    socket.on(
      "conversation_update",
      ({ conversationId }: { conversationId: number }) => {
        if (conversationUpdateTimeoutRef.current[conversationId]) {
          clearTimeout(conversationUpdateTimeoutRef.current[conversationId]);
        }

        conversationUpdateTimeoutRef.current[conversationId] = setTimeout(
          async () => {
            try {
              const updatedConversation = await getConversation(conversationId);

              if (updatedConversation) {
                setConversations((prev) => {
                  const idx = prev.findIndex((c) => c.id === conversationId);
                  if (idx === -1) return prev;

                  const updated = [...prev];

                  updated[idx] = updatedConversation;

                  updated.splice(idx, 1);

                  if (updatedConversation.lastMessage) {
                    return [updatedConversation, ...updated];
                  } else {
                    return [...updated, updatedConversation];
                  }
                });
              }
            } catch (error) {
              console.error("Failed to update conversation:", error);
            }

            delete conversationUpdateTimeoutRef.current[conversationId];
          },
          100
        );
      }
    );

    socket.emit("get_online_users", (resp: { onlineUsers: number[] }) => {
      setOnlineUserIds(resp?.onlineUsers || []);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, selectedConversationId]);

  const handleTyping = (isTyping: boolean) => {
    if (!socketRef.current || !selectedConversationId) return;
    socketRef.current.emit("typing", {
      conversationId: Number(selectedConversationId),
      isTyping,
    });
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", {
          conversationId: Number(selectedConversationId),
          isTyping: false,
        });
      }, 1500);
    }
  };

  const handleChangeMessage = (value: string) => {
    setNewMessage(value);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !selectedConversationId)
      return;
    const payload = {
      conversationId: Number(selectedConversationId),
      content: newMessage.trim(),
      type: "TEXT" as const,
      replyOf: replyingTo?.id || null,
    };
    socketRef.current.emit("send_message", payload);
    setNewMessage("");
    setReplyingTo(null);

    handleTyping(false);

    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
    isAtBottomRef.current = true;
    setHasNewMessage(false);
  };

  const handleDeleteMessage = (message: Message) => {
    setMessageToDelete({
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
    });
    setDeleteModalOpen(true);
  };

  const confirmDeleteMessage = () => {
    if (!socketRef.current || !messageToDelete) return;
    socketRef.current.emit("delete_message", {
      messageId: messageToDelete.id,
      conversationId: messageToDelete.conversationId,
    });
    setMessageToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const handleReplyClick = (replyToMessageId: number) => {
    const targetMessage = messages.find((msg) => msg.id === replyToMessageId);
    if (!targetMessage) return;

    setHighlightedMessageId(replyToMessageId);

    const messageElement = document.getElementById(
      `message-${replyToMessageId}`
    );
    if (messageElement && messageContainerRef.current) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3000);
  };

  useEffect(() => {
    if (!socketRef.current || !selectedConversationId) return;
    socketRef.current.emit("mark_as_seen", {
      conversationId: Number(selectedConversationId),
    });
  }, [selectedConversationId, messages.length]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 mt-[80px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600 text-lg">Đang tải...</p>
      </div>
    );
  }

  if (!isAuthLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (error && (!Array.isArray(conversations) || conversations.length === 0)) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-red-50 text-red-700 mt-[80px] p-4">
        <Info size={48} className="mb-4" />
        <p className="text-xl font-semibold mb-2">Ối, có lỗi xảy ra!</p>
        <p className="text-center mb-6">{error}</p>
        <button
          onClick={() => {
            fetchConversations();
          }}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-100 h-screen">
      <ConversationList
        conversations={conversations}
        filteredConversations={filteredConversations}
        selectedConversationId={selectedConversationId}
        searchValue={searchQuery}
        setSearchValue={setSearchQuery}
        user={currentUserAsMember}
        onConversationSelect={handleConversationSelect}
        onlineUserIds={onlineUserIds}
      />

      <div className="flex-1 flex h-full">
        <div
          className={`flex flex-col bg-white transition-all duration-300 ${
            showInfoSidebar ? "w-[65%]" : "w-full"
          }`}
        >
          {selectedConversationId && selectedConversation ? (
            <>
              <ChatHeader
                conversation={selectedConversation}
                showInfoSidebar={showInfoSidebar}
                setShowInfoSidebar={setShowInfoSidebar}
                currentUser={currentUserAsMember}
                onlineUserIds={onlineUserIds}
              />

              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 bg-gradient-to-b from-white to-gray-50/50"
              >
                {isLoadingMessages && (
                  <div className="flex flex-col justify-center items-center h-full text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="font-semibold">Đang tải tin nhắn...</p>
                  </div>
                )}

                {messagesError && !isLoadingMessages && (
                  <div className="flex flex-col justify-center items-center h-full text-red-500">
                    <MessageSquareText
                      size={48}
                      className="mb-4 text-red-400"
                    />
                    <p className="font-semibold mb-2">Lỗi khi tải tin nhắn</p>
                    <p className="text-sm mb-4">{messagesError}</p>
                    <button
                      onClick={() =>
                        selectedConversationId &&
                        fetchMessages(selectedConversationId)
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {!isLoadingMessages &&
                  !messagesError &&
                  (!Array.isArray(messages) || messages.length === 0) && (
                    <div className="flex flex-col justify-center items-center h-full text-gray-500">
                      <MessageSquareText
                        size={48}
                        className="mb-4 text-gray-400"
                      />
                      <p className="font-semibold">Không có tin nhắn nào</p>
                      <p className="text-sm">
                        Hãy bắt đầu cuộc trò chuyện này!
                      </p>
                    </div>
                  )}

                {!isLoadingMessages &&
                  !messagesError &&
                  Array.isArray(messages) &&
                  messages.length > 0 && (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const sender = getSenderAsMember(message);
                        const isMyMessage =
                          sender.id === currentUserAsMember?.id;
                        const isLastMessage = index === messages.length - 1;
                        const showAvatar = !isMyMessage;

                        const previousMessage =
                          index > 0 ? messages[index - 1] : null;
                        const shouldShowAvatar =
                          showAvatar &&
                          (!previousMessage ||
                            getSenderAsMember(previousMessage).id !==
                              sender.id);

                        return (
                          <div
                            key={message.id}
                            id={`message-${message.id}`}
                            className={`transition-all duration-500 ${
                              highlightedMessageId === message.id
                                ? "bg-yellow-100 rounded-lg p-2 -m-2"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex items-start space-x-3 group ${
                                isMyMessage ? "justify-end" : "justify-start"
                              }`}
                            >
                              {showAvatar && (
                                <div className="flex-shrink-0">
                                  {shouldShowAvatar ? (
                                    <Tooltip
                                      content={`${sender.firstName} ${sender.lastName}`}
                                      position="left"
                                      delay={400}
                                    >
                                      <img
                                        src={
                                          sender.avatar || DEFAULT_AVATAR_URL
                                        }
                                        alt={`${sender.firstName} ${sender.lastName}`}
                                        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                      />
                                    </Tooltip>
                                  ) : (
                                    <div className="w-8 h-8" />
                                  )}
                                </div>
                              )}

                              <div className="flex items-center space-x-2">
                                <div className="max-w-[70%]">
                                  <Tooltip
                                    content={`${new Date(
                                      message.createdAt
                                    ).toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })} lúc ${new Date(
                                      message.createdAt
                                    ).toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`}
                                    position={isMyMessage ? "left" : "right"}
                                    delay={300}
                                  >
                                    <div
                                      className={`rounded-lg p-3 relative cursor-pointer ${
                                        isMyMessage
                                          ? "bg-blue-500 text-white"
                                          : "bg-gray-200 text-gray-800"
                                      }`}
                                    >
                                      {message.replyToMessage && (
                                        <div
                                          onClick={() =>
                                            handleReplyClick(
                                              message.replyToMessage!.id
                                            )
                                          }
                                          className={`text-xs mb-2 p-2 rounded border-l-2 cursor-pointer hover:scale-[1.02] transition-all duration-200 ${
                                            isMyMessage
                                              ? "bg-blue-400 border-blue-200 text-blue-100 hover:bg-blue-300"
                                              : "bg-gray-100 border-gray-400 text-gray-600 hover:bg-gray-50"
                                          }`}
                                        >
                                          <div className="font-medium">
                                            {
                                              message.replyToMessage.senderUser
                                                .firstName
                                            }{" "}
                                            {
                                              message.replyToMessage.senderUser
                                                .lastName
                                            }
                                          </div>
                                          <div className="truncate">
                                            {message.replyToMessage.content}
                                          </div>
                                        </div>
                                      )}
                                      <p className="text-sm">
                                        {message.content}
                                      </p>
                                    </div>
                                  </Tooltip>
                                </div>

                                <div
                                  className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white rounded-full shadow-sm ${
                                    isMyMessage ? "order-first" : ""
                                  }`}
                                >
                                  <Tooltip
                                    content="Trả lời tin nhắn"
                                    position="top"
                                    delay={200}
                                  >
                                    <button
                                      onClick={() =>
                                        handleReplyMessage(message)
                                      }
                                      className="p-2 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                                    >
                                      <Reply size={16} />
                                    </button>
                                  </Tooltip>
                                  {isMyMessage && (
                                    <Tooltip
                                      content="Xóa tin nhắn"
                                      position="top"
                                      delay={200}
                                    >
                                      <button
                                        onClick={() =>
                                          handleDeleteMessage(message)
                                        }
                                        className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isLastMessage &&
                              !isMyMessage &&
                              message.seenBy && (
                                <div className="flex justify-end mt-2">
                                  <div className="flex space-x-1">
                                    {message.seenBy
                                      ?.filter(
                                        (seenItem) =>
                                          seenItem.userId !== sender.id &&
                                          seenItem.userId !==
                                            currentUserAsMember?.id
                                      )
                                      .slice(0, 3)
                                      .map((seenItem) => (
                                        <Tooltip
                                          key={seenItem.userId}
                                          content={`${seenItem.user.firstName} ${seenItem.user.lastName} đã xem`}
                                          position="top"
                                          delay={300}
                                        >
                                          <img
                                            src={
                                              seenItem.user.avatar ||
                                              DEFAULT_AVATAR_URL
                                            }
                                            alt={`${seenItem.user.firstName} ${seenItem.user.lastName} đã xem`}
                                            className="w-4 h-4 rounded-full object-cover border border-white cursor-pointer hover:scale-110 transition-transform duration-200"
                                          />
                                        </Tooltip>
                                      ))}
                                    {message.seenBy &&
                                      message.seenBy.filter(
                                        (seenItem) =>
                                          seenItem.userId !== sender.id &&
                                          seenItem.userId !==
                                            currentUserAsMember?.id
                                      ).length > 3 && (
                                        <Tooltip
                                          content={`Và ${
                                            message.seenBy.filter(
                                              (seenItem) =>
                                                seenItem.userId !== sender.id &&
                                                seenItem.userId !==
                                                  currentUserAsMember?.id
                                            ).length - 3
                                          } người khác đã xem`}
                                          position="top"
                                          delay={300}
                                        >
                                          <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-semibold cursor-pointer hover:scale-110 transition-transform duration-200">
                                            +
                                            {message.seenBy.filter(
                                              (seenItem) =>
                                                seenItem.userId !== sender.id &&
                                                seenItem.userId !==
                                                  currentUserAsMember?.id
                                            ).length - 3}
                                          </div>
                                        </Tooltip>
                                      )}
                                  </div>
                                </div>
                              )}

                            {isLastMessage && isMyMessage && message.seenBy && (
                              <div className="flex justify-end mt-2 mr-2">
                                <div className="flex space-x-1">
                                  {message.seenBy
                                    ?.filter(
                                      (seenItem) =>
                                        seenItem.userId !==
                                        currentUserAsMember?.id
                                    )
                                    .slice(0, 3)
                                    .map((seenItem) => (
                                      <Tooltip
                                        key={seenItem.userId}
                                        content={`${seenItem.user.firstName} ${seenItem.user.lastName} đã xem`}
                                        position="top"
                                        delay={300}
                                      >
                                        <img
                                          src={
                                            seenItem.user.avatar ||
                                            DEFAULT_AVATAR_URL
                                          }
                                          alt={`${seenItem.user.firstName} ${seenItem.user.lastName} đã xem`}
                                          className="w-4 h-4 rounded-full object-cover border border-white cursor-pointer hover:scale-110 transition-transform duration-200"
                                        />
                                      </Tooltip>
                                    ))}
                                  {message.seenBy &&
                                    message.seenBy.filter(
                                      (seenItem) =>
                                        seenItem.userId !==
                                        currentUserAsMember?.id
                                    ).length > 3 && (
                                      <Tooltip
                                        content={`Và ${
                                          message.seenBy.filter(
                                            (seenItem) =>
                                              seenItem.userId !==
                                              currentUserAsMember?.id
                                          ).length - 3
                                        } người khác đã xem`}
                                        position="top"
                                        delay={300}
                                      >
                                        <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-semibold cursor-pointer hover:scale-110 transition-transform duration-200">
                                          +
                                          {message.seenBy.filter(
                                            (seenItem) =>
                                              seenItem.userId !==
                                              currentUserAsMember?.id
                                          ).length - 3}
                                        </div>
                                      </Tooltip>
                                    )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {selectedConversationId &&
                  (() => {
                    const typingIds = (
                      typingByConversation[Number(selectedConversationId)] || []
                    ).filter((id) => id !== currentUserAsMember?.id);
                    if (!typingIds.length || !selectedConversation) return null;
                    const typingMembers = selectedConversation.members.filter(
                      (m) => typingIds.includes(m.id)
                    );
                    return (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            {typingMembers.slice(0, 3).map((m, idx) => (
                              <img
                                key={m.id}
                                src={m.avatar || DEFAULT_AVATAR_URL}
                                alt={`${m.firstName} ${m.lastName}`}
                                title={`${m.firstName} ${m.lastName}`}
                                className={`w-6 h-6 rounded-full object-cover border-2 border-white ${
                                  idx === 0 ? "ml-0" : ""
                                }`}
                              />
                            ))}
                          </div>
                          <div className="rounded-full px-2 py-1 bg-gray-200 text-gray-800 inline-flex items-center">
                            <span
                              className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block mx-1 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-gray-500 rounded-full inline-block animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                <div ref={messagesEndRef} />
              </div>

              <NewMessageNotification
                hasNewMessage={hasNewMessage}
                onNewMessageClick={handleNewMessageClick}
              />

              <MessageInput
                newMessage={newMessage}
                replyingTo={replyingTo}
                user={currentUserAsMember}
                isShowIconPicker={isShowIconPicker}
                setIsShowIconPicker={setIsShowIconPicker}
                fileInputRef={fileInputRef}
                onChange={handleChangeMessage}
                onSend={handleSendMessage}
                onTyping={handleTyping}
                onCancelReply={() => setReplyingTo(null)}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        <div
          className={`bg-white border-l border-gray-200 transition-all duration-300 relative ${
            showInfoSidebar ? "w-[35%]" : "w-0 opacity-0 overflow-hidden"
          }`}
        ></div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

      <DeleteConfirm
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={confirmDeleteMessage}
        type="message"
      />
    </div>
  );
}
