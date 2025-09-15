import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Info, MessageSquareText, Reply, Trash2, Video } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_CONSTANTS } from "../../../constants/constants";

import {
  ConversationList,
  ChatHeader,
  MessageInput,
  EmptyState,
  NewMessageNotification,
  Tooltip,
  MessageReactions,
  ReactionSummary,
  SeenByAvatars,
  InfoSidebar,
  ConversationEditModal,
  CreateConversation,
  SearchMessage,
  Media,
  Link,
  RenderMediaPreview,
} from "../../../components/Message";
import type {
  Conversation,
  Member,
  Message,
  MessagesResponse,
  MessageType,
} from "../../../types/conversation.type";
import type { User } from "../../../types/auth.type";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";
import {
  getConversations,
  getConversation,
  updateConversation,
  removeMemberFromConversation,
  addMemberToConversation,
} from "../../../services/conversation.service";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getMessageContext,
  getMessages,
} from "../../../services/message.service";
import { DeleteConfirm } from "../../../components/popup";
import { uploadFiles } from "../../../services/upload.service";
import { Members } from "../../../components/Message/Members";

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
  const [createConversationModalOpen, setCreateConversationModalOpen] =
    useState(false);
  const [leaveConversationModalOpen, setLeaveConversationModalOpen] =
    useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{
    id: number;
    conversationId: number;
    content: string;
  } | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);
  const [isContextMode, setIsContextMode] = useState<boolean>(false);
  const [isLoadingContextBefore, setIsLoadingContextBefore] =
    useState<boolean>(false);
  const [isLoadingContextAfter, setIsLoadingContextAfter] =
    useState<boolean>(false);
  const [hasMoreMessagesBefore, setHasMoreMessagesBefore] =
    useState<boolean>(true);
  const [hasMoreMessagesAfter, setHasMoreMessagesAfter] =
    useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const [showEditConversationModal, setShowEditConversationModal] =
    useState(false);
  const [sidebarTab, setSidebarTab] = useState<
    "members" | "search" | "media" | "link" | null
  >(null);
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null);
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
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
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
    if (isContextMode) return;
    if (!selectedConversationId || !hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const container = messageContainerRef.current;
      const prevHeight = container?.scrollHeight ?? 0;
      const prevTop = container?.scrollTop ?? 0;

      const nextPage = page + 1;
      const response: MessagesResponse = await getMessages(
        Number(selectedConversationId),
        { page: nextPage, limit }
      );

      if (response?.messages?.length) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = response.messages.filter(
            (m) => !existingIds.has(m.id)
          );
          return [...unique, ...prev];
        });

        setPage(response.meta?.currentPage ?? nextPage);
        setHasNextPage(Boolean(response.meta?.hasNextPage));

        requestAnimationFrame(() => {
          const c = messageContainerRef.current;
          if (!c) return;
          const delta = c.scrollHeight - prevHeight;
          c.scrollTop = prevTop + delta;
        });
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreContextBefore = async () => {
    if (
      !selectedConversationId ||
      isLoadingContextBefore ||
      !hasMoreMessagesBefore
    )
      return;

    try {
      setIsLoadingContextBefore(true);

      const container = messageContainerRef.current;
      if (container) {
        prevScrollHeightRef.current = container.scrollHeight;
        prevScrollTopRef.current = container.scrollTop;
      }

      const first = messages[0];
      if (!first) return;

      const response = await getMessageContext(
        Number(selectedConversationId),
        first.id,
        { before: 10, after: 0 }
      );

      setHasMoreMessagesBefore(response.meta.hasMoreMessagesBefore);

      const filtered = response.messages.filter(
        (m: Message) => m.id !== first.id
      );

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const unique = filtered.filter((m: Message) => !existingIds.has(m.id));
        return unique.length ? [...unique, ...prev] : prev;
      });

      setTimeout(() => {
        const c = messageContainerRef.current;
        if (!c) return;
        const delta = c.scrollHeight - prevScrollHeightRef.current;
        c.scrollTop = prevScrollTopRef.current + delta;
      }, 100);
    } finally {
      setIsLoadingContextBefore(false);
    }
  };

  const loadMoreContextAfter = async () => {
    if (
      !selectedConversationId ||
      isLoadingContextAfter ||
      !hasMoreMessagesAfter
    )
      return;

    try {
      setIsLoadingContextAfter(true);

      const last = messages[messages.length - 1];
      if (!last) return;

      const response = await getMessageContext(
        Number(selectedConversationId),
        last.id,
        { before: 0, after: 10 }
      );

      setHasMoreMessagesAfter(response.meta.hasMoreMessagesAfter);

      const filtered = response.messages.filter(
        (m: Message) => m.id !== last.id
      );

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const unique = filtered.filter((m: Message) => !existingIds.has(m.id));
        return unique.length ? [...prev, ...unique] : prev;
      });
    } finally {
      setIsLoadingContextAfter(false);
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

  const handleRemoveMember = async (member: Member) => {
    try {
      await removeMemberFromConversation(
        Number(selectedConversationId),
        member.id
      );
      socketRef.current?.emit("send_message", {
        conversationId: Number(selectedConversationId),
        type: "SYSTEM" as MessageType,
        content: `${user?.firstName} ${user?.lastName} đã xóa thành viên ${member.firstName} ${member.lastName} khỏi cuộc trò chuyện.`,
      });
    } catch (error) {
      setError("Lỗi khi xóa thành viên");
    }
  };

  const handleSearchMessages = async (searchText: string, page: number = 1) => {
    try {
      const response = await getMessages(Number(selectedConversationId), {
        search: searchText,
        page,
      });
      return {
        ...response,
        searchInfo: response?.searchInfo || {
          query: searchText,
          hasSearch: !!searchText?.trim(),
        },
      };
    } catch (error) {
      setError("Lỗi khi tìm kiếm tin nhắn");
    }
  };

  const handleShowContext = async (messageId: number) => {
    try {
      setIsContextMode(true);

      const response = await getMessageContext(
        Number(selectedConversationId),
        messageId,
        {
          before: 10,
          after: 10,
        }
      );
      setMessages(response.messages);

      setTimeout(() => {
        const target = document.getElementById(
          `message-${response.targetMessageId}`
        );
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedMessageId(response.targetMessageId);
          setTimeout(() => {
            setHighlightedMessageId(null);
          }, 5000);
        } else if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 100);
    } catch (error) {
      setError("Lỗi khi lấy nội dung tin nhắn");
    }
  };

  const handleCreateConversation = async (conversation: Conversation) => {
    socketRef.current?.emit("send_message", {
      conversationId: Number(conversation.id),
      type: "SYSTEM" as MessageType,
      content: `${user?.firstName} ${user?.lastName} đã tạo cuộc trò chuyện.`,
    });
    setCreateConversationModalOpen(false);
  };

  const handleAddMember = async (member: Member) => {
    try {
      const res = await addMemberToConversation(
        Number(selectedConversationId),
        member.id
      );

      socketRef.current?.emit("send_message", {
        conversationId: Number(res.conversation.id),
        type: "SYSTEM" as MessageType,
        content: `${user?.firstName} ${user?.lastName} đã thêm thành viên ${member.firstName} ${member.lastName} vào cuộc trò chuyện.`,
      });
    } catch (error) {
      setError("Lỗi khi thêm thành viên");
    }
  };
  const handleLeaveConversation = async () => {
    try {
      socketRef.current?.emit("send_message", {
        conversationId: Number(selectedConversationId),
        type: "SYSTEM" as MessageType,
        content: `${user?.firstName} ${user?.lastName} đã rời khỏi cuộc trò chuyện.`,
      });
      setConversations((prev) =>
        prev.filter((c) => c.id !== Number(selectedConversationId))
      );
      await removeMemberFromConversation(
        Number(selectedConversationId),
        currentUserAsMember?.id || 0
      );

      navigate("/messages");
    } catch (error) {
      setError("Lỗi khi rời khỏi cuộc trò chuyện");
    } finally {
      setLeaveConversationModalOpen(false);
    }
  };
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
    setHasMoreMessagesBefore(true);
    setHasMoreMessagesAfter(true);
    setPage(1);

    const container = messageContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      isAtBottomRef.current = distanceFromBottom < 80;
      lastScrollTopRef.current = scrollTop;
      if (scrollTop <= 80) {
        if (isContextMode) {
          loadMoreContextBefore();
        } else {
          loadOlderMessages();
        }
      }
      if (distanceFromBottom <= 80 && isContextMode) {
        loadMoreContextAfter();
      }
    };
    container.addEventListener("scroll", handleScroll);
    isAtBottomRef.current = true;
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedConversationId, isContextMode, messages.length]);

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
        if (message.senderUser.id !== user?.id) {
          setMessages((prev) => [...prev, message]);

          socket.emit("mark_as_seen", {
            conversationId: message.conversationId,
          });

          if (!isAtBottomRef.current) {
            setHasNewMessage(true);
          }
        } else {
          if (message.type === "MEDIA") {
            setMessages((prev) => [...prev, message]);
          } else {
            setMessages((prev) => {
              const tempMessageIndex = prev.findIndex((msg) => {
                if (msg.type === "TEXT" && msg.senderUser.id === user?.id) {
                  return msg.content === message.content;
                }
                return false;
              });

              if (tempMessageIndex !== -1) {
                const updated = [...prev];
                updated[tempMessageIndex] = message;
                return updated;
              } else {
                return [...prev, message];
              }
            });
          }
        }

        if (isAtBottomRef.current || message.senderUser.id === user?.id) {
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

    socket.on("message_reaction", ({ result }) => {
      const { message: updatedMessage } = result;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id
            ? { ...msg, reactions: updatedMessage.reactions }
            : msg
        )
      );
    });

    socket.on(
      "message_seen",
      ({
        conversationId,
        user,
        messages,
      }: {
        conversationId: number;
        user: User;
        messages: Message[];
      }) => {
        if (
          selectedConversationId &&
          String(conversationId) === selectedConversationId
        ) {
          setMessages((prev) =>
            prev.map((m) => {
              const exists = m.seenBy?.some((s) => s.userId === user.id);
              if (exists) return m;
              return {
                ...m,
                seenBy: [
                  ...(m.seenBy || []),
                  {
                    messageId: m.id,
                    userId: user.id,
                    createdAt: new Date().toISOString(),
                    user: {
                      id: user.id,
                      username: user.username,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      avatar: user.avatar || null,
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
                  const updated = [...prev];

                  const idx = prev.findIndex((c) => c.id === conversationId);
                  if (idx === -1) {
                    if (updatedConversation.lastMessage) {
                      return [updatedConversation, ...updated];
                    } else {
                      return [...updated, updatedConversation];
                    }
                  }

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socketRef.current || !selectedConversationId)
      return;

    const messageText = newMessage.trim();

    const tempMessage: Message = {
      id: Date.now(),
      content: messageText,
      type: "TEXT" as MessageType,
      conversationId: parseInt(selectedConversationId),
      sender: user!.id,
      senderUser: {
        id: user!.id,
        username: user!.username,
        firstName: user!.firstName,
        lastName: user!.lastName,
        avatar: user!.avatar || DEFAULT_AVATAR_URL,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyOf: replyingTo?.id || null,
      replyToMessage: replyingTo,
      reactions: [],
      seenBy: [],
    };
    setMessages((prev) => [...prev, tempMessage]);

    const payload = {
      conversationId: Number(selectedConversationId),
      content: messageText,
      type: "TEXT" as MessageType,
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

  const uploadSingleFile = async (file: File) => {
    if (!socketRef.current || !selectedConversationId) return;

    const preview = URL.createObjectURL(file);

    try {
      const { uploadFiles } = await import("../../../services/upload.service");
      const results = await uploadFiles([file]);

      if (results && results.length > 0) {
        const result = results[0];
        const isVideoResult =
          (result.resourceType || "").toLowerCase() === "video";
        const contentPayload = JSON.stringify({
          url: result.url,
          kind: isVideoResult ? "VIDEO" : "IMAGE",
        });

        socketRef.current.emit("send_message", {
          conversationId: Number(selectedConversationId),
          content: contentPayload,
          type: "MEDIA" as MessageType,
          replyOf: replyingTo?.id || null,
        });
      }
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(preview);
      }, 1000);
    }

    setReplyingTo(null);
  };

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (!socketRef.current || !selectedConversationId) return;

      files.forEach((file) => {
        uploadSingleFile(file);
      });
    },
    [selectedConversationId, replyingTo, user]
  );

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

  const handleReplyClick = async (replyToMessageId: number) => {
    const targetMessage = messages.find((msg) => msg.id === replyToMessageId);

    if (targetMessage) {
      setHighlightedMessageId(replyToMessageId);
      const element = document.getElementById(`message-${replyToMessageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => setHighlightedMessageId(null), 5000);
      return;
    }

    try {
      setIsContextMode(true);
      const response = await getMessageContext(
        Number(selectedConversationId),
        replyToMessageId,
        { before: 10, after: 10 }
      );

      setMessages(response.messages);
      setHasMoreMessagesBefore(response.meta.hasMoreMessagesBefore);
      setHasMoreMessagesAfter(response.meta.hasMoreMessagesAfter);

      setTimeout(() => {
        const element = document.getElementById(`message-${replyToMessageId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedMessageId(replyToMessageId);
        }
      }, 100);

      setTimeout(() => setHighlightedMessageId(null), 5000);
    } catch (err) {
      setError("Lỗi khi lấy nội dung trả lời");
      console.error(err);
    }
  };

  const handleReactionToggle = (
    messageId: number,
    conversationId: number,
    emoji: string
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit("toggle_reaction", {
      messageId,
      conversationId,
      reaction: emoji,
    });
  };

  const getLastSeenMessageForUsers = (messages: Message[]) => {
    const lastSeenMap = new Map<number, number>();

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.seenBy) {
        for (const seen of message.seenBy) {
          if (!lastSeenMap.has(seen.userId)) {
            lastSeenMap.set(seen.userId, message.id);
          }
        }
      }
    }

    return lastSeenMap;
  };

  const getUsersWhoLastSeenThisMessage = (message: Message) => {
    if (!message.seenBy || message.seenBy.length === 0) return [];

    const lastSeenMap = getLastSeenMessageForUsers(messages);

    return message.seenBy.filter(
      (seen) => lastSeenMap.get(seen.userId) === message.id
    );
  };

  const shouldShowSeenBy = (message: Message, isMyMessage: boolean) => {
    if (message.type === "SYSTEM") return false;
    if (!message.seenBy || message.seenBy.length === 0) return false;

    if (!isMyMessage) {
      const isLastMessage = message.id === messages[messages.length - 1]?.id;
      return isLastMessage;
    }

    const usersWhoLastSeenThis = getUsersWhoLastSeenThisMessage(message);
    return usersWhoLastSeenThis.length > 0;
  };

  const handleUpdateConversation = async (
    conversationId: number,
    data: {
      name?: string;
      avatar?: File;
    }
  ) => {
    let success: boolean = false;
    try {
      if (!data.avatar && data.name === selectedConversation?.name) {
        setError("Vui lòng nhập tên hoặc chọn ảnh");
        return;
      }
      const avatarUpload = data.avatar
        ? await uploadFiles([data.avatar])
        : null;
      const avatarUrl: string = avatarUpload ? avatarUpload[0].url : "";
      avatarUrl
        ? await updateConversation(conversationId, {
            name: data.name,
            avatar: avatarUrl,
          })
        : await updateConversation(conversationId, {
            name: data.name,
          });

      socketRef.current?.emit("send_message", {
        conversationId,
        type: "SYSTEM" as MessageType,
        content: `${user?.firstName} ${user?.lastName} đã cập nhật cuộc trò chuyện.`,
      });
      setError(null);
      success = true;
    } catch (error) {
      setError("Có lỗi xảy ra khi cập nhật cuộc trò chuyện");
    } finally {
      if (success) setShowEditConversationModal(false);
    }
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
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-100 h-screen items-center justify-center">
      <ConversationList
        conversations={conversations}
        filteredConversations={filteredConversations}
        selectedConversationId={selectedConversationId}
        searchValue={searchQuery}
        setSearchValue={setSearchQuery}
        user={currentUserAsMember}
        onConversationSelect={handleConversationSelect}
        onlineUserIds={onlineUserIds}
        onAddConversation={() => setCreateConversationModalOpen(true)}
      />

      <div className="flex-1 flex h-full">
        <div
          className={`flex flex-col bg-white transition-all duration-300 ${
            showInfoSidebar ? "w-[70%]" : "w-full"
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
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
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
                        const showAvatar = !isMyMessage;

                        const previousMessage =
                          index > 0 ? messages[index - 1] : null;
                        const shouldShowAvatar =
                          showAvatar &&
                          (!previousMessage ||
                            getSenderAsMember(previousMessage).id !==
                              sender.id);

                        if (message.type === "SYSTEM") {
                          return (
                            <div
                              key={message.id}
                              id={`message-${message.id}`}
                              className="flex justify-center"
                            >
                              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {message.content}
                              </div>
                            </div>
                          );
                        }

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
                              className={`flex items-start space-x-3 group relative ${
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
                                <div className="">
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
                                    <div className="relative">
                                      <div
                                        className={`rounded-lg p-3 cursor-pointer ${
                                          message.type === "TEXT"
                                            ? isMyMessage
                                              ? "bg-blue-500 text-white"
                                              : "bg-gray-200 text-gray-800"
                                            : "p-0 bg-transparent"
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
                                                message.replyToMessage
                                                  .senderUser.firstName
                                              }{" "}
                                              {
                                                message.replyToMessage
                                                  .senderUser.lastName
                                              }
                                            </div>
                                            <div className="truncate break-all">
                                              {(() => {
                                                const rt =
                                                  message.replyToMessage?.type;
                                                if (rt === "MEDIA") {
                                                  try {
                                                    const m = JSON.parse(
                                                      message.replyToMessage
                                                        .content
                                                    );
                                                    return m.kind === "VIDEO"
                                                      ? "[Video]"
                                                      : "[Hình ảnh]";
                                                  } catch {
                                                    return "[Media]";
                                                  }
                                                }
                                                if (rt === "POST") {
                                                  try {
                                                    const d = JSON.parse(
                                                      message.replyToMessage
                                                        .content
                                                    );
                                                    return d.caption
                                                      ? d.caption
                                                      : "[Bài viết]";
                                                  } catch {
                                                    return "[Bài viết]";
                                                  }
                                                }
                                                if (rt === "RECIPE") {
                                                  try {
                                                    const d = JSON.parse(
                                                      message.replyToMessage
                                                        .content
                                                    );
                                                    return d.title
                                                      ? d.title
                                                      : "[Công thức]";
                                                  } catch {
                                                    return "[Công thức]";
                                                  }
                                                }
                                                return message.replyToMessage
                                                  .content;
                                              })()}
                                            </div>
                                          </div>
                                        )}
                                        {(() => {
                                          if (message.type === "TEXT") {
                                            return (
                                              <p className="text-sm break-all">
                                                {message.content}
                                              </p>
                                            );
                                          }
                                          if (message.type === "MEDIA") {
                                            try {
                                              const media = JSON.parse(
                                                message.content
                                              ) as {
                                                url: string;
                                                kind?: string;
                                              };
                                              const kind = (
                                                media.kind || "IMAGE"
                                              ).toUpperCase();

                                              if (kind === "VIDEO") {
                                                return (
                                                  <div
                                                    className="relative cursor-pointer"
                                                    onClick={() =>
                                                      setSelectedMedia(message)
                                                    }
                                                  >
                                                    <video
                                                      src={media.url}
                                                      muted
                                                      controls
                                                      className="rounded-lg max-h-72"
                                                    />
                                                  </div>
                                                );
                                              }
                                              return (
                                                <img
                                                  onClick={() =>
                                                    setSelectedMedia(message)
                                                  }
                                                  src={media.url}
                                                  alt="media"
                                                  className="rounded-lg max-h-72 object-contain"
                                                />
                                              );
                                            } catch {
                                              return (
                                                <p className="text-sm break-all">
                                                  {message.content}
                                                </p>
                                              );
                                            }
                                          }
                                          if (message.type === "POST") {
                                            try {
                                              const data = JSON.parse(
                                                message.content
                                              ) as {
                                                id: number;
                                                caption?: string;
                                                image: string | null;
                                              };
                                              return (
                                                <a
                                                  href={`/post/${data.id}`}
                                                  className={`block p-3 rounded-lg border max-w-[400px] ${
                                                    isMyMessage
                                                      ? "bg-blue-400/40 border-blue-200"
                                                      : "bg-gray-100 border-gray-300"
                                                  }`}
                                                >
                                                  <div className="text-sm font-medium mb-1">
                                                    Chia sẻ bài viết
                                                  </div>
                                                  {data.caption ? (
                                                    <div className="text-sm line-clamp-2">
                                                      {data.caption}
                                                    </div>
                                                  ) : (
                                                    <div className="text-sm italic">
                                                      Xem bài viết
                                                    </div>
                                                  )}
                                                  {data.image && (
                                                    <img
                                                      src={data.image}
                                                      alt="post"
                                                      className="object-contain mt-4"
                                                    />
                                                  )}
                                                </a>
                                              );
                                            } catch {
                                              return (
                                                <p className="text-sm break-all">
                                                  {message.content}
                                                </p>
                                              );
                                            }
                                          }
                                          if (message.type === "RECIPE") {
                                            try {
                                              const data = JSON.parse(
                                                message.content
                                              ) as {
                                                id: number;
                                                title?: string;
                                                slug?: string | null;
                                              };
                                              return (
                                                <a
                                                  href={
                                                    data.slug
                                                      ? `/recipes/${data.slug}`
                                                      : `/recipes/${data.id}`
                                                  }
                                                  className={`block p-3 rounded-lg border ${
                                                    isMyMessage
                                                      ? "bg-blue-400/40 border-blue-200"
                                                      : "bg-gray-100 border-gray-300"
                                                  }`}
                                                >
                                                  <div className="text-sm font-medium mb-1">
                                                    Chia sẻ công thức
                                                  </div>
                                                  {data.title ? (
                                                    <div className="text-sm line-clamp-2">
                                                      {data.title}
                                                    </div>
                                                  ) : (
                                                    <div className="text-sm italic">
                                                      Xem công thức
                                                    </div>
                                                  )}
                                                </a>
                                              );
                                            } catch {
                                              return (
                                                <p className="text-sm break-words">
                                                  {message.content}
                                                </p>
                                              );
                                            }
                                          }
                                          return (
                                            <p className="text-sm break-all">
                                              {message.content}
                                            </p>
                                          );
                                        })()}
                                      </div>

                                      <ReactionSummary
                                        reactions={message.reactions || []}
                                        isMyMessage={isMyMessage}
                                      />
                                    </div>
                                  </Tooltip>
                                </div>

                                <div
                                  className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white rounded-full shadow-sm ${
                                    isMyMessage ? "order-first" : ""
                                  }`}
                                >
                                  <MessageReactions
                                    reactions={message.reactions || []}
                                    messageId={message.id}
                                    conversationId={message.conversationId}
                                    currentUserId={
                                      currentUserAsMember?.id || null
                                    }
                                    onReactionToggle={handleReactionToggle}
                                    showOnlyTrigger={true}
                                  />

                                  <Tooltip
                                    content="Trả lời tin nhắn"
                                    position="top"
                                    delay={200}
                                  >
                                    <button
                                      onClick={() =>
                                        handleReplyMessage(message)
                                      }
                                      className="p-2 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-110 cursor-pointer"
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
                                        className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-200 hover:scale-110 cursor-pointer"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </div>

                            {shouldShowSeenBy(message, isMyMessage) && (
                              <div
                                className={`flex justify-end mt-2 ${
                                  isMyMessage ? "mr-2" : ""
                                }`}
                              >
                                <SeenByAvatars
                                  seenByToDisplay={
                                    isMyMessage
                                      ? getUsersWhoLastSeenThisMessage(message)
                                      : message.seenBy
                                  }
                                  seenBy={message.seenBy}
                                  currentUserId={
                                    currentUserAsMember?.id || null
                                  }
                                  senderId={sender.id}
                                />
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
                onChange={handleChangeMessage}
                onSend={handleSendMessage}
                onTyping={handleTyping}
                onCancelReply={() => setReplyingTo(null)}
                onEmojiSelect={(emoji) => {
                  handleChangeMessage(newMessage + emoji);
                }}
                onFilesSelected={handleFilesSelected}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        <div
          className={`bg-white border-l border-gray-200 transition-all duration-300 relative ${
            showInfoSidebar ? "w-[30%]" : "w-0 opacity-0 overflow-hidden"
          }`}
        >
          {selectedConversation &&
            (sidebarTab === "members" ? (
              <Members
                members={selectedConversation.members}
                onRemoveMember={handleRemoveMember}
                onAddMember={handleAddMember}
                onBack={() => {
                  setSidebarTab(null);
                }}
              />
            ) : sidebarTab === "search" ? (
              <SearchMessage
                onSearch={handleSearchMessages}
                onShowContext={handleShowContext}
                onClose={() => {
                  setSidebarTab(null);
                  setIsContextMode(false);
                  if (selectedConversationId) {
                    fetchMessages(selectedConversationId);
                  }
                }}
                conversation={selectedConversation}
              />
            ) : sidebarTab === "media" ? (
              <Media
                onBack={() => {
                  setSidebarTab(null);
                }}
                conversationId={Number(selectedConversationId)}
              />
            ) : sidebarTab === "link" ? (
              <Link
                onBack={() => {
                  setSidebarTab(null);
                }}
                conversationId={Number(selectedConversationId)}
              />
            ) : (
              <InfoSidebar
                conversation={selectedConversation}
                onEditConversation={() => {
                  setShowEditConversationModal(true);
                }}
                onClickMembers={() => {
                  setSidebarTab("members");
                }}
                onClickSearch={() => {
                  setSidebarTab("search");
                }}
                onClickMedia={() => {
                  setSidebarTab("media");
                }}
                onClickLink={() => {
                  setSidebarTab("link");
                }}
                onClickLeave={() => {
                  setLeaveConversationModalOpen(true);
                }}
              />
            ))}
        </div>
      </div>

      <ConversationEditModal
        conversation={selectedConversation || ({} as Conversation)}
        isOpen={showEditConversationModal}
        onClose={() => {
          setShowEditConversationModal(false);
        }}
        onSave={handleUpdateConversation}
        error={error}
      />

      <DeleteConfirm
        isOpen={leaveConversationModalOpen}
        onClose={() => {
          setLeaveConversationModalOpen(false);
        }}
        onConfirm={handleLeaveConversation}
        type="leave_conversation"
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

      <CreateConversation
        isOpen={createConversationModalOpen}
        onClose={() => {
          setCreateConversationModalOpen(false);
        }}
        onCreated={handleCreateConversation}
      />

      {selectedMedia && (
        <RenderMediaPreview
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}
