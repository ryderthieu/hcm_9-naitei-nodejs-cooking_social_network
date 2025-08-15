import { useState } from "react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
} from "@heroicons/react/24/solid";
import { FaShare } from "react-icons/fa";

interface PostActionBarProps {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount?: number;
  isLiked: boolean;
  isSaved?: boolean;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  onShareClick?: () => void;
  onSaveClick?: () => void;
  variant?: "feed" | "detail";
  className?: string;
}

export default function PostActionBar({
  likesCount,
  commentsCount,
  sharesCount,
  savesCount = 0,
  isLiked,
  isSaved,
  onLikeToggle,
  onCommentClick,
  onShareClick,
  onSaveClick,
  variant = "feed",
  className = "",
}: PostActionBarProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const getActionStyles = (action: string) => {
    const isHovered = hoveredAction === action;
    const isActive = (action === "like" && isLiked) ||
      (action === "save" && isSaved);

    if (isActive || isHovered) {
      return {
        container: "bg-yellow-100 rounded-full px-4 py-2",
        icon: "text-yellow-600",
        text: "text-yellow-700",
      };
    }

    return {
      container: "rounded-full px-4 py-2",
      icon: "text-gray-600",
      text: "text-gray-600",
    };
  };

  const likeStyles = getActionStyles("like");
  const commentStyles = getActionStyles("comment");
  const shareStyles = getActionStyles("share");
  const saveStyles = getActionStyles("save");

  const gap = variant === "feed" ? "gap-22" : "gap-4";
  const padding = variant === "feed" ? "py-3" : "py-5";

  return (
    <div
      className={`bg-yellow-25 border border-yellow-100 rounded-lg px-6 ${padding} ${className}`}
    >
      <div className="flex items-center justify-center">
        <div className={`flex items-center ${gap}`}>
          <button
            onClick={onLikeToggle}
            onMouseEnter={() => setHoveredAction("like")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${likeStyles.container}`}
          >
            {isLiked ? (
              <HeartIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} text-yellow-600`} />
            ) : (
              <HeartIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${likeStyles.icon}`} />
            )}
            <span className={`text-sm font-medium ${likeStyles.text}`}>
              {likesCount}
            </span>
          </button>

          <button
            onClick={onCommentClick}
            onMouseEnter={() => setHoveredAction("comment")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${commentStyles.container}`}
          >
            <ChatBubbleOvalLeftIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${commentStyles.icon}`} />
            <span className={`text-sm font-medium ${commentStyles.text}`}>
              {commentsCount}
            </span>
          </button>

          <button
            onClick={onShareClick}
            onMouseEnter={() => setHoveredAction("share")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${shareStyles.container}`}
          >
            <FaShare className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${shareStyles.icon}`} />
            <span className={`text-sm font-medium ${shareStyles.text}`}>
              {sharesCount}
            </span>
          </button>

          <button
            onClick={onSaveClick}
            onMouseEnter={() => setHoveredAction("save")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${saveStyles.container}`}
          >
            <BookmarkIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${isSaved ? "text-yellow-600" : saveStyles.icon}`} />
            <span className={`text-sm font-medium ${saveStyles.text}`}>{savesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
