import { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon, Cog6ToothIcon, UserIcon } from "@heroicons/react/24/outline";
import { ChefHat } from 'lucide-react';
import { recipesService, type RecipeListItem } from "../../services/recipe.service";
import { showErrorAlert } from "../../utils/errorHandler";

interface RecipeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: RecipeListItem) => void;
}

export default function RecipeSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: RecipeSelectionModalProps) {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [recipeTab, setRecipeTab] = useState<'system' | 'personal'>('system');

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen, recipeTab]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        searchRecipes(searchTerm);
      } else {
        loadRecipes();
      }
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipesService.getRecipes({ limit: 20 });
      setRecipes(response.recipes);
    } catch (error) {
      showErrorAlert("Lỗi khi tải danh sách công thức");
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async (term: string) => {
    try {
      setLoading(true);
      const response = await recipesService.getRecipes({ name: term, limit: 20 });
      setRecipes(response.recipes);
    } catch (error) {
      showErrorAlert("Lỗi khi tìm kiếm công thức");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipe = (recipe: RecipeListItem) => {
    onSelect(recipe);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Chọn công thức</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setRecipeTab('system')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${recipeTab === 'system'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600'
                }`}
            >
              <Cog6ToothIcon className="w-4 h-4 inline mr-1" />
              Hệ thống
            </button>
            <button
              onClick={() => setRecipeTab('personal')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${recipeTab === 'personal'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600'
                }`}
            >
              <UserIcon className="w-4 h-4 inline mr-1" />
              Của tôi
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm công thức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-6 pb-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe)}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <ChefHat className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{recipe.title}</h4>
                  <p className="text-sm text-gray-500">
                    {recipe.description ? recipe.description.substring(0, 50) + '...' : 'Chưa có mô tả'}
                  </p>
                </div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <XMarkIcon className="w-3 h-3 text-white" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm.trim()
                ? 'Không tìm thấy công thức phù hợp'
                : 'Chưa có công thức nào'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
