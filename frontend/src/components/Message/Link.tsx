import React, { useEffect, useState } from "react";
import { MdOutlineNavigateBefore } from "react-icons/md";
import { ExternalLink, FileText, ChefHat, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Message, MessageType } from "../../types/conversation.type";
import { getMessages } from "../../services/message.service";

interface LinkProps {
  onBack: () => void;
  conversationId: number;
}

interface LinkContent {
  id: number;
  caption: string;
  image: string;
}

export const Link: React.FC<LinkProps> = ({ onBack, conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [parsedMessages, setParsedMessages] = useState<
    Array<{
      message: Message & { content: LinkContent };
    }>
  >([]);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const postResponse = await getMessages(conversationId, {
        type: "POST" as MessageType,
      });

      const recipeResponse = await getMessages(conversationId, {
        type: "RECIPE" as MessageType,
      });

      const allMessages = [
        ...postResponse.messages,
        ...recipeResponse.messages,
      ];
      allMessages.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setMessages(allMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (conversationId != null) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    const parseMessages = () => {
      const parsed = messages
        .map((message) => {
          try {
            const content = JSON.parse(message.content) as LinkContent;
            if (message.type === "POST" || message.type === "RECIPE") {
              return {
                message: {
                  ...message,
                  content,
                },
              };
            }
            return null;
          } catch (e) {
            console.error("Invalid JSON content for message:", message.id, e);
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      setParsedMessages(parsed as any);
    };

    parseMessages();
  }, [messages]);

  const handleItemClick = (type: "POST" | "RECIPE", id: number) => {
    if (type === "POST") {
      navigate(`/post/${id}`);
    } else if (type === "RECIPE") {
      navigate(`/detail-recipe/${id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderItem = (
    message: Message & { content: LinkContent },
    type: "POST" | "RECIPE"
  ) => (
    <div
      key={message.id}
      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
      onClick={() => handleItemClick(type, message.content.id)}
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        {message.content.image ? (
          <img
            src={message.content.image}
            alt="thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {type === "POST" ? (
              <FileText className="w-6 h-6 text-gray-400" />
            ) : (
              <ChefHat className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          {type === "POST" ? (
            <FileText className="w-4 h-4 text-blue-500" />
          ) : (
            <ChefHat className="w-4 h-4 text-green-500" />
          )}
          <span className="text-sm font-medium text-gray-600">
            {type === "POST" ? "Bài viết" : "Công thức"}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
          {message.content.caption}
        </h3>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>
              {message.senderUser.firstName} {message.senderUser.lastName}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(message.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <ExternalLink className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4">
        <MdOutlineNavigateBefore
          size={24}
          className="cursor-pointer"
          onClick={onBack}
        />
        <h2 className="text-lg font-semibold flex-1 text-center">Liên kết</h2>
      </div>

      <hr className="text-gray-200" />

      <div className="flex-1 overflow-y-auto p-4">
        {parsedMessages.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có liên kết nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parsedMessages.map(({ message }) => {
              return renderItem(message, message.type as "POST" | "RECIPE");
            })}
          </div>
        )}
      </div>
    </div>
  );
};
