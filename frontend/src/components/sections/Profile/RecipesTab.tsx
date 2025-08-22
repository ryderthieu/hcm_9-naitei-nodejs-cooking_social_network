import React, { useState, useEffect } from "react";
import { BookOpen, Clock, ChefHat } from "lucide-react";
import { recipesService } from "../../../services/recipe.service";
import type { RecipeListItem } from "../../../types/recipe.type";
import { useNavigate } from "react-router-dom";

interface RecipesTabProps {
  username: string;
}

export default function RecipesTab({ username }: RecipesTabProps) {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await recipesService.getRecipesByUser(username);
        setRecipes(recipesData || []);
      } catch (err) {
        setError("Không thể tải công thức");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchRecipes();
    }
  }, [username]);

  const handleRecipeClick = (recipe: RecipeListItem) => {
    navigate(`/detail-recipe/${recipe.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-red-500 mb-4">
          <BookOpen className="w-16 h-16 mx-auto text-red-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lỗi tải công thức
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-gray-500 mb-4">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chưa có công thức nào
        </h3>
        <p className="text-gray-600">Người dùng này chưa tạo công thức nào.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          onClick={() => handleRecipeClick(recipe)}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {recipe.title}
            </h3>
            {recipe.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {recipe.description}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <span>
                  Bởi {recipe.author?.firstName} {recipe.author?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
