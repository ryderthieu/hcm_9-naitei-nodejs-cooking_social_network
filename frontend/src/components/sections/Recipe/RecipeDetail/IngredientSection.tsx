import { ChevronDown } from "lucide-react";
import {
  formatQuantity,
  calculateIngredientQuantity,
} from "../../../../utils/recipeUtils";
import { useState, useEffect, useRef } from "react";

interface Ingredient {
  quantity: number;
  ingredient: {
    name?: string;
    image?: string;
    unit?: string;
  };
}

interface Recipe {
  servings?: number;
  ingredients?: Ingredient[];
}

interface IngredientsSectionProps {
  recipe: Recipe;
  servings: number;
  setServings: (servings: number) => void;
}

export default function IngredientsSection({
  recipe,
  servings,
  setServings,
}: IngredientsSectionProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const originalServings = recipe?.servings || 1;
  const servingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleServingChange = (newServings: number) => {
    setServings(newServings);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Thành phần
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Dành cho</span>
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center border border-gray-300 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors cursor-pointer min-w-[80px]"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="font-medium">{servings}</span>
              <span className="text-sm text-gray-500 ml-1">người</span>
              <ChevronDown
                className={`w-4 h-4 ml-2 text-gray-500 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[80px]">
                {servingOptions.map((option) => (
                  <div
                    key={option}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-center ${
                      option === servings
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : ""
                    }`}
                    onClick={() => handleServingChange(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {recipe?.ingredients && recipe.ingredients.length > 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">
            Nguyên liệu
          </h3>
          <div className="space-y-4">
            {recipe.ingredients.map((ingredient, index) => {
              const adjustedQuantity = calculateIngredientQuantity(
                ingredient?.quantity,
                originalServings,
                servings
              );

              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
                      {ingredient?.ingredient?.image ? (
                        <img
                          src={ingredient.ingredient.image}
                          alt={ingredient?.ingredient?.name || "Ingredient"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                          <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">
                      {ingredient?.ingredient?.name || "Unknown ingredient"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {formatQuantity(
                      adjustedQuantity,
                      ingredient?.ingredient?.unit
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-500">
            Không có nguyên liệu cho công thức này.
          </p>
        </div>
      )}
    </div>
  );
}
