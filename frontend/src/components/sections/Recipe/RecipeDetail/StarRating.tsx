import { Star } from "lucide-react";

type StarRatingProps = {
  rating?: number;
  onRatingChange?: (value: number) => void;
  size?: "sm" | "md" | "lg" | "xl";
  readonly?: boolean;
  showValue?: boolean;
};

const StarRating = ({
  rating = 0,
  onRatingChange,
  size = "md",
  readonly = false,
  showValue = false,
}: StarRatingProps) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const handleStarClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(Math.round(value));
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`
            ${sizes[size]} 
            ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} 
            transition-all duration-200
            ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 hover:fill-yellow-300 hover:text-yellow-300"
            }
          `}
          onClick={() => handleStarClick(star)}
        />
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating;
