import React, { useEffect, useState } from "react";
import { Image, Video, Play, X } from "lucide-react";
import { MdOutlineNavigateBefore } from "react-icons/md";
import type { Message, MessageType } from "../../types/conversation.type";
import { getMessages } from "../../services/message.service";

interface MediaProps {
  onBack: () => void;
  conversationId: number;
}
interface MediaContent {
  kind: "IMAGE" | "VIDEO";
  url: string;
}
interface RenderMediaPreviewProps {
  media: Message;
  onClose: () => void;
}
export const RenderMediaPreview: React.FC<RenderMediaPreviewProps> = ({
  media,
  onClose,
}: RenderMediaPreviewProps) => {
  if (!media) return null;
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  useEffect(() => {
    if (!media) return;

    const { content } = media;

    let parsedContent: MediaContent | null = null;

    if (typeof content === "string") {
      try {
        parsedContent = JSON.parse(content) as MediaContent;
      } catch (e) {
        console.error("Invalid JSON content", e);
      }
    } else if (typeof content === "object" && content !== null) {
      parsedContent = content as MediaContent;
    }

    if (parsedContent) {
      setKind(parsedContent.kind);
      setUrl(parsedContent.url);
    }
  }, [media]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10 hover:cursor-pointer"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="rounded-lg overflow-hidden">
          {kind === "IMAGE" ? (
            <img
              src={url || ""}
              alt="media"
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          ) : (
            <video
              src={url || ""}
              controls
              autoPlay
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};
export const Media: React.FC<MediaProps> = ({ onBack, conversationId }) => {
  const [messages, setMessages] = useState<
    (Message & { content: MediaContent })[]
  >([]);
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null);

  const getVideoThumbnail = (url: string) => {
    const thumbnailUrl = url
      .replace("/video/upload/", "/video/upload/so_0/")
      .replace(".mp4", ".jpg");
    return thumbnailUrl;
  };

  const fetchMessages = async () => {
    try {
      const response = await getMessages(conversationId, {
        type: "MEDIA" as MessageType,
      });
      const parsedMessages = response.messages.map((msg: Message) => ({
        ...msg,
        content: JSON.parse(msg.content) as MediaContent,
      }));
      setMessages(parsedMessages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (conversationId != null) {
      fetchMessages();
    }
  }, [conversationId]);

  const openMediaPreview = (media: Message) => {
    setSelectedMedia(media);
  };
  const closePreview = () => setSelectedMedia(null);

  const renderGridView = () => (
    <div className="grid grid-cols-2 gap-3">
      {messages.map((media) => (
        <div
          key={media.id}
          className="group cursor-pointer"
          onClick={() => openMediaPreview(media)}
        >
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={
                media.content.kind === "VIDEO"
                  ? getVideoThumbnail(media.content.url)
                  : media.content.url
              }
              alt={media.content.kind}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />

            {media.content.kind === "VIDEO" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-gray-800" />
                </div>
              </div>
            )}

            <div className="absolute top-2 left-2">
              {media.content.kind === "IMAGE" ? (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Image className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Video className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
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
        <h2 className="text-lg font-semibold flex-1 text-center">
          Ảnh & Video
        </h2>
      </div>

      <hr className="text-gray-200" />

      <div className="flex-1 overflow-y-auto p-2">{renderGridView()}</div>

      {selectedMedia && (
        <RenderMediaPreview media={selectedMedia} onClose={closePreview} />
      )}
    </div>
  );
};
