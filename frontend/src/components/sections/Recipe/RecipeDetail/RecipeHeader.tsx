import { useState } from "react";
import StarRating from "./StarRating";

interface RecipeHeaderProps {
  recipe: any;
}

export default function RecipeHeader({ recipe }: RecipeHeaderProps) {
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);

  const formatCookingTime = (time: number) => {
    if (time >= 60) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      return minutes > 0 ? `${hours} tiếng ${minutes} phút` : `${hours} tiếng`;
    }
    return `${time} phút`;
  };
  const getAuthorName = () => {
    if (recipe?.author) {
      return recipe.author.firstName && recipe.author.lastName
        ? `${recipe.author.firstName} ${recipe.author.lastName}`
        : recipe.author.name || "Oshisha";
    }
    return "Oshisha";
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "Dễ";
      case "MEDIUM":
        return "Trung bình";
      case "HARD":
        return "Khó";
      default:
        return "Dễ";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "HARD":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "🐣";
      case "MEDIUM":
        return "😁";
      case "HARD":
        return "🔥";
      default:
        return "🐣";
    }
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight mt-4">
        {recipe?.title || "Recipe Title"}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={
                  recipe?.author?.avatar ||
                  "https://res.cloudinary.com/dfaq5hbmx/image/upload/v1748692877/sushi_x1k4mg.png"
                }
                alt={getAuthorName()}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {getAuthorName()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500">
              Thời gian nấu: {formatCookingTime(recipe?.time || 60)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${getDifficultyColor(
                recipe?.categories?.difficultyLevel
              )}`}
            ></div>
            <span className="text-xs text-gray-500">
              Độ khó: {getDifficultyText(recipe?.categories?.difficultyLevel)}{" "}
              {getDifficultyIcon(recipe?.categories?.difficultyLevel)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <StarRating
              rating={recipe?.averageRating || 0}
              readonly
              size="sm"
              showValue
            />
            {recipe?.totalReviews > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                ({recipe.totalReviews} đánh giá)
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
