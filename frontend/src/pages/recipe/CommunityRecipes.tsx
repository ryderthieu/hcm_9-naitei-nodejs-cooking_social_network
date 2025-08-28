import { useState, useEffect } from "react";
import CarouselPlugin from "../../components/sections/Home/CarouselHero";
import RecipeGrid from "../../components/sections/Recipe/RecipeGrid";
import { getRecipeCategories } from "../../utils/enumMaps";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const CommunityRecipes = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories] = useState(() => getRecipeCategories());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const getCategoryQuery = () => {
    if (selectedCategories.length === 0) return {};

    const query: any = {};
    selectedCategories.forEach((categoryId) => {
      for (const group of categories) {
        for (const item of group.items) {
          if (item._id === categoryId) {
            query[group.key] = categoryId;
            break;
          }
        }
      }
    });
    return query;
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        let categoryGroupKey = "";
        categories.forEach((group) => {
          if (group.items.some((item) => item._id === categoryId)) {
            categoryGroupKey = group.key;
          }
        });

        const filtered = prev.filter((id) => {
          return !categories.some(
            (group) =>
              group.key === categoryGroupKey &&
              group.items.some((item) => item._id === id)
          );
        });

        return [...filtered, categoryId];
      }
    });
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const getCategoryName = (categoryId: string) => {
    for (const group of categories) {
      for (const item of group.items) {
        if (item._id === categoryId) {
          return item.name;
        }
      }
    }
    return "Unknown";
  };

  const getCategoryGroupName = (categoryId: string) => {
    for (const group of categories) {
      for (const item of group.items) {
        if (item._id === categoryId) {
          return group.name;
        }
      }
    }
    return "Unknown";
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const getSelectedCategoryInGroup = (groupKey: string) => {
    return selectedCategories.find((categoryId) => {
      return categories.some(
        (group) =>
          group.key === groupKey &&
          group.items.some((item) => item._id === categoryId)
      );
    });
  };

  return (
    <div className="">
      <CarouselPlugin />
      <div className="mx-[124px] my-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cộng đồng công thức nấu ăn
          </h1>
          <p className="text-gray-600 text-lg">
            Khám phá hàng nghìn công thức nấu ăn ngon từ cộng đồng
          </p>
        </div>

        <div className="flex gap-8">
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Lọc theo danh mục
              </h2>

              {selectedCategories.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-amber-800">
                      Đã chọn ({selectedCategories.length}):
                    </h3>
                    <button
                      onClick={clearAllCategories}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedCategories.map((categoryId) => (
                      <div
                        key={categoryId}
                        className="flex items-center justify-between px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-amber-600 font-medium">
                            {getCategoryGroupName(categoryId)}
                          </span>
                          <span className="font-medium">
                            {getCategoryName(categoryId)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCategory(categoryId)}
                          className="ml-2 hover:bg-amber-200 rounded-full p-1 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {categories.map((group) => {
                  const isExpanded = expandedGroups.has(group.key);
                  const selectedCategory = getSelectedCategoryInGroup(
                    group.key
                  );

                  return (
                    <div
                      key={group.key}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleGroup(group.key)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            {group.name}
                          </span>
                          {selectedCategory && (
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                              {getCategoryName(selectedCategory)}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-white border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-2">
                            {group.items.map((category) => (
                              <button
                                key={category._id}
                                onClick={() =>
                                  handleCategoryToggle(category._id)
                                }
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  selectedCategories.includes(category._id)
                                    ? "bg-amber-500 text-white shadow-md"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategories.length === 0
                  ? "Tất cả công thức"
                  : `Công thức theo danh mục đã chọn (${selectedCategories.length})`}
              </h2>
              {selectedCategories.length > 0 && (
                <p className="text-gray-600">
                  Hiển thị công thức phù hợp với các tiêu chí đã chọn
                </p>
              )}
            </div>

            <RecipeGrid
              title=""
              currentUser=""
              initialQuery={getCategoryQuery()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityRecipes;
