import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaNewspaper,
  FaBook,
  FaUser,
  FaFilter,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { searchUsers } from "../../../services/user.service";
import type { User } from "../../../types/auth.type";
import { PostList } from "../../../components/Post";
import RecipeGrid from "../../../components/sections/Recipe/RecipeGrid";
import UserCard from "../../../components/common/user/UserCard";
import {
  MealTypeMap,
  CuisineMap,
  OccasionsMap,
  DietaryPreferencesMap,
  MainIngredientsMap,
  CookingMethodMap,
  TimeBasedMap,
  DifficultyLevelMap,
  MealType,
  Cuisine,
  Occasions,
  DietaryPreferences,
  MainIngredients,
  CookingMethod,
  TimeBased,
  DifficultyLevel,
} from "../../../utils/enumMaps";

const CONST = {
  NEWEST: "newest",
  OLDEST: "oldest",
  FOLLOWED: "followed",
};

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSearchQuery, setPageSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<
    "posts" | "recipes" | "users"
  >("posts");

  const navigate = useNavigate();
  const location = useLocation();

  const [postSort, setPostSort] = useState<string>(CONST.NEWEST);
  const [postFilterFollow, setPostFilterFollow] = useState<string>("all");
  const [recipeIngredient, setRecipeIngredient] = useState<string>("all");
  const [recipeTime, setRecipeTime] = useState<string>("all");
  const [recipeDifficulty, setRecipeDifficulty] = useState<string>("all");

  const [recipeMealType, setRecipeMealType] = useState<string>("all");
  const [recipeCuisine, setRecipeCuisine] = useState<string>("all");
  const [recipeOccasions, setRecipeOccasions] = useState<string>("all");
  const [recipeDietaryPreferences, setRecipeDietaryPreferences] =
    useState<string>("all");
  const [recipeCookingMethod, setRecipeCookingMethod] = useState<string>("all");

  const [userResult, setUserResult] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get("q") || "";
    const filterFromUrl =
      (params.get("filter") as "posts" | "recipes" | "users") || "posts";

    setSearchQuery(queryFromUrl);
    setPageSearchQuery(queryFromUrl);
    setActiveFilter(filterFromUrl);

    setPostSort(params.get("postSort") || CONST.NEWEST);
    setPostFilterFollow(params.get("postFilterFollow") || "all");
    setRecipeIngredient(params.get("recipeIngredient") || "all");
    setRecipeTime(params.get("recipeTime") || "all");
    setRecipeDifficulty(params.get("recipeDifficulty") || "all");

    setRecipeMealType(params.get("recipeMealType") || "all");
    setRecipeCuisine(params.get("recipeCuisine") || "all");
    setRecipeOccasions(params.get("recipeOccasions") || "all");
    setRecipeDietaryPreferences(
      params.get("recipeDietaryPreferences") || "all"
    );
    setRecipeCookingMethod(params.get("recipeCookingMethod") || "all");
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery) {
        setUserResult([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (activeFilter !== "users") return;
        const userData = await searchUsers(searchQuery);
        setUserResult(userData);
      } catch (err: any) {
        setError(err.message || "Đã có lỗi xảy ra khi tìm kiếm.");
        setUserResult([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, activeFilter]);

  const updateUrlParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(location.search);
    Object.keys(newParams).forEach((key) => {
      if (newParams[key]) {
        params.set(key, newParams[key]);
      } else {
        params.delete(key);
      }
    });
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handlePageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: pageSearchQuery });
  };

  const handleActiveFilterChange = (
    newFilter: "posts" | "recipes" | "users"
  ) => {
    updateUrlParams({ filter: newFilter, q: searchQuery });
  };

  const handlePostSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({
      postSort: e.target.value,
      filter: "posts",
      q: searchQuery,
    });
  };

  const handlePostFilterFollowChange = (postFilterFollow: string) => {
    updateUrlParams({
      postFilterFollow: postFilterFollow,
      filter: "posts",
      q: searchQuery,
    });
  };

  const handleRecipeIngredientChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeIngredient: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({
      recipeTime: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeDifficultyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeDifficulty: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeMealTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeMealType: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeCuisineChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeCuisine: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeOccasionsChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeOccasions: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeDietaryPreferencesChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeDietaryPreferences: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const handleRecipeCookingMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateUrlParams({
      recipeCookingMethod: e.target.value,
      filter: "recipes",
      q: searchQuery,
    });
  };

  const renderSidebarSubFilter = () => {
    if (activeFilter === "posts") {
      return (
        <div className="mt-3 space-y-2 pl-2">
          <select
            value={postSort}
            onChange={handlePostSortChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value={CONST.NEWEST}>Gần nhất</option>
            <option value={CONST.OLDEST}>Cũ nhất</option>
          </select>

          <button
            className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
              postFilterFollow === CONST.FOLLOWED
                ? "bg-[#FFB800] text-white border-[#FFB800]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
            onClick={() =>
              handlePostFilterFollowChange(
                postFilterFollow === CONST.FOLLOWED ? "all" : CONST.FOLLOWED
              )
            }
          >
            Đã follow
          </button>
        </div>
      );
    }

    if (activeFilter === "recipes") {
      return (
        <div className="mt-3 space-y-2 pl-2">
          <select
            value={recipeMealType}
            onChange={handleRecipeMealTypeChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Bữa ăn</option>
            {Object.entries(MealTypeMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeCuisine}
            onChange={handleRecipeCuisineChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Ẩm thực</option>
            {Object.entries(CuisineMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeOccasions}
            onChange={handleRecipeOccasionsChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Dịp đặc biệt</option>
            {Object.entries(OccasionsMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeDietaryPreferences}
            onChange={handleRecipeDietaryPreferencesChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Chế độ ăn</option>
            {Object.entries(DietaryPreferencesMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeIngredient}
            onChange={handleRecipeIngredientChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Nguyên liệu chính</option>
            {Object.entries(MainIngredientsMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeCookingMethod}
            onChange={handleRecipeCookingMethodChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Phương pháp nấu</option>
            {Object.entries(CookingMethodMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeTime}
            onChange={handleRecipeTimeChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800] mb-2"
          >
            <option value="all">Thời gian nấu</option>
            {Object.entries(TimeBasedMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={recipeDifficulty}
            onChange={handleRecipeDifficultyChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FFB800] focus:border-[#FFB800]"
          >
            <option value="all">Độ khó</option>
            {Object.entries(DifficultyLevelMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return null;
  };

  const renderResults = () => {
    if (loading)
      return <p className="text-center text-gray-600">Đang tải kết quả...</p>;
    if (error) return <p className="text-center text-red-500">Lỗi: {error}</p>;
    if (!searchQuery)
      return (
        <p className="text-center text-gray-500">
          Nhập từ khóa để bắt đầu tìm kiếm.
        </p>
      );

    switch (activeFilter) {
      case "posts":
        return (
          <PostList
            filter={{
              keyword: searchQuery,
              sortBy: postSort === CONST.OLDEST ? "oldest" : "newest",
              following: postFilterFollow === CONST.FOLLOWED ? true : undefined,
            }}
          />
        );

      case "recipes":
        return (
          <div
            className="
              [&>div>div]:grid
              [&>div>div]:[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]
              [&>div>div]:gap-6
              [&>div>div]:md:gap-8
            "
          >
            <RecipeGrid
              title=""
              currentUser=""
              initialQuery={{
                name: searchQuery,
                mealType: recipeMealType !== "all" ? recipeMealType : undefined,
                cuisine: recipeCuisine !== "all" ? recipeCuisine : undefined,
                occasions:
                  recipeOccasions !== "all" ? recipeOccasions : undefined,
                dietaryPreferences:
                  recipeDietaryPreferences !== "all"
                    ? recipeDietaryPreferences
                    : undefined,
                mainIngredient:
                  recipeIngredient !== "all" ? recipeIngredient : undefined,
                cookingMethod:
                  recipeCookingMethod !== "all"
                    ? recipeCookingMethod
                    : undefined,
                timeBased: recipeTime !== "all" ? recipeTime : undefined,
                level:
                  recipeDifficulty !== "all" ? recipeDifficulty : undefined,
              }}
            />
          </div>
        );

      case "users":
        if (userResult.length === 0)
          return (
            <p className="text-center text-gray-500">
              Không tìm thấy người dùng nào.
            </p>
          );
        return (
          <div className="space-y-4">
            {userResult?.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        );

      default:
        return (
          <p className="text-center text-gray-500">
            Chọn một bộ lọc để xem kết quả.
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 px-[110px] flex justify-center">
        <div
          className="w-full rounded-3xl shadow-lg px-8 py-10"
          style={{
            background:
              "linear-gradient(30deg, rgba(246,60,60,0.9) 0%, rgba(255,175,1,0.75) 50%, rgba(255,225,1,0.6) 100%)",
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Tìm kiếm
          </h1>
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handlePageSearchSubmit} className="relative">
              <input
                type="text"
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, công thức, người dùng..."
                className="w-full px-6 py-4 rounded-xl border-2 border-white/30 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-lg text-lg placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#FFB800] hover:text-[#E6A600] transition-colors"
              >
                <FaSearch size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="py-8 px-[110px]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <button className="text-gray-500">
                    <FaFilter size={20} />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Bộ lọc
                  </h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => handleActiveFilterChange("posts")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeFilter === "posts"
                        ? "bg-[#FFF4D6] text-[#FFB800] shadow-md border border-[#FFB800]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <FaNewspaper size={20} />
                    <span>Bài viết</span>
                  </button>
                  {activeFilter === "posts" && renderSidebarSubFilter()}
                  <button
                    onClick={() => handleActiveFilterChange("recipes")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeFilter === "recipes"
                        ? "bg-[#FFF4D6] text-[#FFB800] shadow-md border border-[#FFB800]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <FaBook size={20} />
                    <span>Công thức</span>
                  </button>
                  {activeFilter === "recipes" && renderSidebarSubFilter()}
                  <button
                    onClick={() => handleActiveFilterChange("users")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeFilter === "users"
                        ? "bg-[#FFF4D6] text-[#FFB800] shadow-md border border-[#FFB800]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <FaUser size={20} />
                    <span>Người dùng</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 min-h-[300px]">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="text-[#FFB800] mr-2">Kết quả tìm kiếm</span>
                  {searchQuery && (
                    <span className="text-gray-600">cho "{searchQuery}"</span>
                  )}
                </h2>
                {renderResults()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
