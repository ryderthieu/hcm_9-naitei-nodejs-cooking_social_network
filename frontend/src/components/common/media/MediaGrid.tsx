import React from "react";
import { useNavigate } from "react-router-dom";

interface MediaItem {
  id?: number;
  url: string;
  type: "IMAGE" | "VIDEO";
}

interface MediaGridProps {
  items: MediaItem[];
  postId: number;
  className?: string;
}

export default function MediaGrid({
  items,
  postId,
  className = "",
}: MediaGridProps) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const handleClick = () => {
    navigate(`/post/${postId}`);
  };

  const displayItems = items.slice(0, 5);
  const remainingCount = items.length - 5;

  const getGridLayout = () => {
    switch (displayItems.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      case 4:
        return "grid-cols-2";
      case 5:
        return "grid-cols-3";
      default:
        return "grid-cols-1";
    }
  };

  const getItemLayout = (index: number) => {
    if (displayItems.length === 3) {
      return index === 0 ? "row-span-2" : "";
    }
    if (displayItems.length === 5) {
      return index === 0 ? "row-span-2" : "";
    }
    return "";
  };

  const getGridHeight = () => {
    switch (displayItems.length) {
      case 1:
        return "h-96";
      case 2:
        return "h-80";
      case 3:
        return "h-80";
      case 4:
        return "h-80";
      case 5:
        return "h-80";
      default:
        return "h-96";
    }
  };

  return (
    <div className={`w-full cursor-pointer ${className}`} onClick={handleClick}>
      <div className={`grid ${getGridLayout()} gap-1 ${getGridHeight()}`}>
        {displayItems.map((item, index) => (
          <div
            key={index}
            className={`relative overflow-hidden ${getItemLayout(index)} ${
              index === 4 && remainingCount > 0
                ? "brightness-75 contrast-125"
                : ""
            }`}
          >
            {item.type === "VIDEO" ? (
              <div className="w-full h-full relative">
                <video
                  className="w-full h-full object-cover"
                  src={item.url}
                  preload="metadata"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Video</span>
                </div>
              </div>
            ) : (
              <img
                className="w-full h-full object-cover"
                src={item.url}
                alt={`media ${index + 1}`}
              />
            )}

            {index === 4 && remainingCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/25"></div>
                <span className="relative text-white text-2xl font-bold drop-shadow-lg z-10">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
