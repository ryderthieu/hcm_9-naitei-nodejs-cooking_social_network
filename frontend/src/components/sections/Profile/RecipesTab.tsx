import React, { useState, useEffect } from "react";
import { BookOpen, Clock, MoreVertical } from "lucide-react";
import { recipesService } from "../../../services/recipe.service";
import type { RecipeListItem } from "../../../types/recipe.type";
import { useNavigate } from "react-router-dom";
import { AlertPopup } from "../../../components/popup";
import { useAlertPopup } from "../../../hooks/useAlertPopup";
import RecipeCard from "../../sections/Recipe/RecipeCard";
import { useAuth } from "../../../contexts/AuthContext";

interface RecipesTabProps {
  username: string;
}

export default function RecipesTab({ username }: RecipesTabProps) {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { alert, showError, showSuccess, closeAlert } = useAlertPopup();
  const { user } = useAuth();
  const currentUsername = user?.username ?? "";

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const recipesData = await recipesService.getRecipesByUser(username);
        setRecipes(recipesData || []);
      } catch (err) {
        setError("Không thể tải công thức");
        showError("Không thể tải công thức");
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

  const handleDelete = async (id: number | string) => {
    try {
      await recipesService.deleteRecipe(Number(id));
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setOpenMenuId(null);
      showSuccess("Xóa thành công!");
    } catch (err: any) {
      console.error("Xóa thất bại:", err);
      showError("Xóa thất bại: " + (err.message || err));
    }
  };

  const handleEdit = (id: number) => {
    setOpenMenuId(null);
    navigate(`/edit-recipe/${id}`);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  if (loading) {
    return (
      <>
        <AlertPopup {...alert} onClose={closeAlert} />
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
      </>
    );
  }

  if (error) {
    return (
      <>
        <AlertPopup {...alert} onClose={closeAlert} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-red-500 mb-4">
            <BookOpen className="w-16 h-16 mx-auto text-red-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải công thức
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </>
    );
  }

  if (recipes.length === 0) {
    return (
      <>
        <AlertPopup {...alert} onClose={closeAlert} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-gray-500 mb-4">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có công thức nào
          </h3>
          <p className="text-gray-600">Người dùng này chưa tạo công thức nào.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AlertPopup {...alert} onClose={closeAlert} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {recipe.images && recipe.images.length > 0 ? (
                  <img
                    src={recipe.images[0].imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <BookOpen className={`w-12 h-12 text-gray-400 ${recipe.images && recipe.images.length > 0 ? 'hidden' : ''}`} />

                <div className="absolute bottom-3 right-3 bg-white text-xs px-2 py-1 rounded-full shadow">
                  <span className="text-orange-600 font-semibold">
                    {recipe.author?.username}
                  </span>
                </div>

                {currentUsername === username && (
                  <div className="absolute top-3 right-3">
                    <button 
                      className="bg-white rounded-full p-1 shadow hover:scale-110 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(recipe.id);
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>

                    {openMenuId === recipe.id && (
                      <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg py-1 w-28 flex flex-col z-10 border border-gray-100">
                        <button
                          className="text-left px-3 hover:bg-gray-100 text-sm font-semibold py-2 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(recipe.id);
                          }}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className="text-left px-3 hover:bg-gray-100 text-sm text-red-500 font-semibold py-2 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(recipe.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {recipe.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>30 phút</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRecipeClick(recipe)}
                  className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                >
                  Xem công thức
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
