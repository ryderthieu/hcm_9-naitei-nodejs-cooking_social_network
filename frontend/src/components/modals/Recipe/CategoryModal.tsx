import { X } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  [key: string]: any;
};

type CategoryGroup = {
  key: string;
  name: string;
  items: Category[];
};

type CategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryGroup[];
  selectedCategories: string[];
  onToggleCategory: (category: Category) => void;
  onSelectAll?: () => void;
  onClearAll: () => void;
  title?: string;
  description?: string;
};

const CategoryModal = ({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearAll,
  title = "Chọn danh mục món ăn",
  description = "Chọn các danh mục phù hợp với công thức của bạn",
}: CategoryModalProps) => {
  if (!isOpen) return null;

  const getCategoryNameById = (categoryId: string) => {
    let categoryName = "Danh mục";
    categories.forEach((group) => {
      group.items.forEach((cat) => {
        if (cat._id === categoryId) {
          categoryName = cat.name;
        }
      });
    });
    return categoryName;
  };

  const getCategoryById = (categoryId: string) => {
    let categoryObject = null;
    categories.forEach((group) => {
      group.items.forEach((cat) => {
        if (cat._id === categoryId) {
          categoryObject = cat;
        }
      });
    });
    return categoryObject;
  };

  const getCategoryGroupEmoji = (key: string) => {
    const emojiMap: Record<string, string> = {
      mealType: "🍽️",
      cuisine: "🌍",
      cookingMethod: "👨‍🍳",
      mainIngredients: "🥬",
      dietaryPreferences: "🥗",
      occasions: "🎉",
      timeBased: "⏰",
      difficultyLevel: "📊",
      default: "📂",
    };
    return emojiMap[key] || emojiMap.default;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="fixed inset-0 w-full h-full" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-scroll no-scrollbar relative z-10 animate-in fade-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            <p className="text-xs text-amber-600 mt-1">
              💡 Mỗi loại danh mục chỉ có thể chọn một giá trị
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedCategories.length > 0 && (
          <div className="p-4 bg-amber-50 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Đã chọn ({selectedCategories.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const categoryName = getCategoryNameById(categoryId);

                return (
                  <span
                    key={categoryId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-sm rounded-full"
                  >
                    {categoryName}
                    <button
                      type="button"
                      onClick={() => {
                        const categoryObject = getCategoryById(categoryId);
                        if (categoryObject) {
                          onToggleCategory(categoryObject);
                        }
                      }}
                      className="ml-1 hover:bg-amber-600 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {categories.map((categoryGroup) => (
            <div key={categoryGroup.key} className="space-y-3">
              <h4 className="font-semibold text-gray-800 text-lg flex items-center">
                <span className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                  {getCategoryGroupEmoji(categoryGroup.key)}
                </span>
                {categoryGroup.name}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoryGroup.items.map((category) => {
                  const isSelected = selectedCategories.some(
                    (id) => id === category._id
                  );

                  const hasOtherSelected = selectedCategories.some((id) => {
                    if (id === category._id) return false;
                    return categories.some(
                      (group) =>
                        group.key === categoryGroup.key &&
                        group.items.some((item) => item._id === id)
                    );
                  });

                  return (
                    <button
                      key={category._id}
                      type="button"
                      disabled={hasOtherSelected && !isSelected}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 hover:shadow-md ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-lg scale-105"
                          : hasOtherSelected && !isSelected
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                      onClick={() => onToggleCategory(category)}
                    >
                      <div className="flex items-center justify-center">
                        <span>{category.name}</span>
                        {isSelected && (
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            {selectedCategories.length} danh mục đã chọn
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClearAll}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              disabled={selectedCategories.length === 0}
            >
              Xóa tất cả
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
