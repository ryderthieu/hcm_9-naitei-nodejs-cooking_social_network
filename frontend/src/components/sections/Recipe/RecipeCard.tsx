import { Clock, Heart, MoreVertical } from "lucide-react";
import {
  MealTypeMap,
  CuisineMap,
  MealType,
  Cuisine,
} from "../../../utils/enumMaps";
import { useNavigate } from "react-router-dom";

interface CategoryDto {
  mealType?: MealType;
  cuisine?: Cuisine;
}
interface RecipeCardProps {
  id: number;
  image: string | string[];
  category: CategoryDto;
  title: string;
  time: string;
  author: string;
  isFavorite?: boolean;
}

const RecipeCard = ({
  id,
  image,
  category,
  title,
  time,
  author,
  isFavorite = false,
}: RecipeCardProps) => {
  const navigate = useNavigate();
  const displayImage = Array.isArray(image) ? image[0] : image;

  return (
    <div className="w-[300px] bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
      <div className="relative w-full h-[160px]">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {category?.mealType && (
            <span className="bg-amber-50 text-orange-600 font-semibold text-xs px-3 py-1 rounded-full shadow">
              {MealTypeMap[category.mealType] ?? category.mealType}
            </span>
          )}
          {category?.cuisine && (
            <span className="bg-amber-50 text-orange-600 font-semibold text-xs px-3 py-1 rounded-full shadow">
              {CuisineMap[category.cuisine] ?? category.cuisine}
            </span>
          )}
        </div>
        <button className="absolute top-3 right-10 bg-white rounded-full p-1 shadow hover:scale-110 transition">
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
        <button className="absolute top-3 right-3 bg-white rounded-full p-1 shadow hover:scale-110 transition">
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
        <div className="absolute bottom-3 right-3 bg-white text-xs px-2 py-1 rounded-full shadow">
          <span className="text-orange-600 font-semibold">{author}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-gray-900 font-semibold text-base mb-3">{title}</h3>
        <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {time} phút
          </div>
        </div>

        <button
          onClick={() => navigate(`/detail-recipe/${id}`)}
          className="cursor-pointer w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white py-2 rounded-full font-medium hover:opacity-90 transition"
        >
          Xem công thức
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
