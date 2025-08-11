import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface MediaItem {
  id?: number;
  url: string;
  type: "IMAGE" | "VIDEO";
}

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
}

export default function MediaCarousel({ items, className = "" }: MediaCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = items.length;

  const go = (dir: -1 | 1) => {
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return total - 1;
      if (next >= total) return 0;
      return next;
    });
  };

  const currentItem = items[index];
  const nextItem = items[(index + 1) % total];
  const showDouble = total >= 2 && currentItem.type === "IMAGE" && nextItem.type === "IMAGE";

  if (!currentItem) return null;

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {total > 1 && (
        <>
          <button
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 z-10 flex items-center justify-center transition-colors"
            onClick={() => go(-1)}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 z-10 flex items-center justify-center transition-colors"
            onClick={() => go(1)}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </>
      )}

      {showDouble ? (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          <div className="w-full h-full flex items-center justify-center">
            <img
              className="w-full h-full object-contain"
              src={currentItem.url}
              alt="media 1"
            />
          </div>
          <div className="w-full h-full flex items-center justify-center">
            <img
              className="w-full h-full object-contain"
              src={nextItem.url}
              alt="media 2"
            />
          </div>
        </div>
      ) : currentItem.type === "VIDEO" ? (
        <div className="w-full h-full relative flex items-center justify-center">
          <video
            className="w-full h-full object-contain"
            src={currentItem.url}
            controls
            preload="metadata"
            onError={(e) => {
              console.error("Video loading error:", e);
              const videoElement = e.target as HTMLVideoElement;
              const container = videoElement.parentElement;
              if (container) {
                container.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-100">
                    <div class="text-center">
                      <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <p class="text-sm text-gray-500">Video không thể phát</p>
                      <p class="text-xs text-gray-400 mt-1">Có thể do định dạng không hỗ trợ</p>
                    </div>
                  </div>
                `;
              }
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Video</span>
          </div>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <span>Audio</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <img
            className="w-full h-full object-contain"
            src={currentItem.url}
            alt="media"
          />
        </div>
      )}

      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {items.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
