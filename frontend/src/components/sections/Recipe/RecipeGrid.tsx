import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { recipesService } from "../../../services/recipe.service";
import type { QueryRecipesDto } from "../../../types/recipe.type";
import { MealType, Cuisine } from "../../../utils/enumMaps";

interface CategoryDto {
  mealType?: MealType;
  cuisine?: Cuisine;
}
interface Recipe {
  id?: string;
  _id?: string;
  image: string;
  category: CategoryDto;
  title: string;
  time: string;
  author: string;
  isFavorite?: boolean;
}

interface RecipeGridProps {
  title: string;
  initialQuery?: QueryRecipesDto;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ title, initialQuery }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRecipes = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await recipesService.getRecipes({
        ...initialQuery,
        page: pageNum,
      });
      const itemsFromServer = data.recipes || [];
      const mappedItems = itemsFromServer.map((item: any) => ({
        id: item.id,
        _id: item.id,
        image: item.images?.[0]?.imageUrl || item.image || item.image_url || "",
        category: {
          mealType: item.categories?.mealType || "",
          cuisine: item.categories?.cuisine || "",
        },
        title: item.title || "",
        time: item.time?.toString() || "",
        author: item.author?.username || "",
        isFavorite: item.savedByUsers?.length > 0 || false,
      }));
      if (pageNum === 1) {
        setRecipes(mappedItems);
      } else {
        setRecipes((prev) => [...prev, ...mappedItems]);
      }
      const total = data.meta?.total || 0;
      const limit = data.meta?.limit || 10;
      const currentPage = data.meta?.page || 1;
      setShowLoadMore(currentPage * limit < total);
    } catch (error: any) {
      console.error("Lỗi tải công thức:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRecipes(1);
  }, [initialQuery]);
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage);
  };

  return (
    <div className="container mx-auto mb-8">
      <div className="mb-8">
        <h1 className="font-bold text-2xl text-gray-800 mb-2">{title}</h1>
        <div className="w-16 h-1 bg-gradient-to-br from-orange-500 to-amber-500 mb-6"></div>
      </div>
      {errorMessage && (
        <div className="text-center py-12 text-red-500">
          <p>{errorMessage}</p>
        </div>
      )}
      {!errorMessage && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe._id || recipe.id || index}
                image={recipe.image}
                category={recipe.category}
                title={recipe.title}
                time={recipe.time}
                author={recipe.author}
                isFavorite={recipe.isFavorite}
              />
            ))}
          </div>
          {showLoadMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 md:px-8 py-1 md:py-3 bg-[#ff4b4b] cursor-pointer text-white font-bold rounded-3xl border-2 hover:bg-transparent hover:text-[#FF6363] hover:border-[#FF6363] transition duration-300 text-sm md:text-base shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? "Đang tải..." : "Xem thêm"}
              </button>
            </div>
          )}
          {recipes.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Không tìm thấy công thức nào.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeGrid;
