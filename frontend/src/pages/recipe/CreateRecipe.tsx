import { useState } from "react";
import {
  Plus,
  Minus,
  X,
  Upload,
  Clock,
  Users,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const generateUniqueId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

export default function CreateRecipeForm() {
  const navigate = useNavigate();
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("1");
  const [cookingTime, setCookingTime] = useState("");
  const [ingredients, setIngredients] = useState([
    {
      id: generateUniqueId(),
      name: "",
      amount: "",
      unit: "",
      ingredientId: null,
    },
  ]);
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [steps, setSteps] = useState([
    { id: generateUniqueId(), summary: "", detail: "", time: "", images: [] },
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCategoryCount] = useState(5);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="py-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight">
          Tạo công thức mới
        </h1>
        <p className="text-gray-800 mt-2">
          Chia sẻ công thức nấu ăn yêu thích của bạn
        </p>
      </div>

      <div className="">
        <form className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <label className="block text-base font-medium text-gray-700 mb-3">
                Hình ảnh món ăn
              </label>
              <div className="relative group">
                <div className="bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl aspect-square flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-300 hover:shadow-md">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" />
                      <Upload className="w-12 h-12 text-gray-500 mb-3" />
                      <span className="text-gray-700 font-medium">
                        Tải ảnh lên
                      </span>
                      <span className="text-gray-500 text-sm mt-1">
                        PNG, JPG, GIF
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <label
                  htmlFor="recipeName"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Tên món ăn
                </label>
                <input
                  id="recipeName"
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Ví dụ: Gà rán giòn rụm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                  required
                />
              </div>{" "}
              <div>
                <label
                  htmlFor="description"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Mô tả món ăn
                </label>{" "}
                <textarea
                  key="recipe-description"
                  id="description"
                  value={description}
                  placeholder="Mô tả ngắn gọn về món ăn của bạn..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                />
              </div>{" "}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Số người ăn
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="px-3 py-4 border border-gray-300 rounded-l-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="w-full px-4 py-3 border-y border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center"
                      placeholder="1"
                      min="1"
                    />
                    <button
                      type="button"
                      className="px-3 py-4 border border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Thời gian nấu (phút)
                  </label>
                  <input
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>{" "}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Danh mục món ăn
                </label>{" "}
                <p className="text-sm text-gray-500 mb-3">
                  Chọn các danh mục phù hợp với món ăn của bạn
                </p>{" "}
                <div className="flex flex-wrap gap-2 py-1">
                  {selectedCategories
                    .slice(0, visibleCategoryCount)
                    .map((categoryId, index) => {
                      let categoryName = "Unknown";

                      return (
                        <button
                          key={categoryId}
                          type="button"
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-amber-500 text-white shadow-md"
                        >
                          {categoryName}
                        </button>
                      );
                    })}
                  {selectedCategories.length > visibleCategoryCount && (
                    <div className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      +{selectedCategories.length - visibleCategoryCount}
                    </div>
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>{" "}
                </div>{" "}
              </div>
            </div>
          </div>{" "}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl border border-gray-200">
              <div className="p-6">
                {" "}
                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    1
                  </span>
                  Nguyên liệu
                </h3>
                <div className="space-y-3">
                  {ingredients.map((ingredient, idx) => (
                    <div
                      key={`ingredient-${idx}-${ingredient.name}`}
                      className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                    >
                      {" "}
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Tên nguyên liệu"
                            value={ingredient.name}
                            className={`w-full p-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              ingredient.ingredientId
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300"
                            }`}
                            required
                          />

                          {ingredient.ingredientId && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <span className="text-green-600 text-xs font-medium flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Đã chọn
                              </span>
                            </div>
                          )}
                          {activeIngredientIndex === idx &&
                            ingredientSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                {ingredientSuggestions.map((suggestion) => (
                                  <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex justify-between">
                                      <span>Name</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          {isSearching && activeIngredientIndex === idx && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <svg
                                className="animate-spin h-4 w-4 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 100-16 8 8 0 000 16zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-20">
                        <input
                          type="text"
                          placeholder="Số lượng"
                          value={ingredient.amount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>{" "}
                      <div className="w-24">
                        <select
                          value={ingredient.unit}
                          disabled={!!ingredient.ingredientId}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            ingredient.ingredientId
                              ? "border-green-500 bg-green-50 text-gray-600 cursor-not-allowed"
                              : "border-gray-300"
                          }`}
                          title={
                            ingredient.ingredientId
                              ? "Đơn vị được khóa cho nguyên liệu từ database"
                              : ""
                          }
                        >
                          <option value="">Đơn vị</option>
                        </select>
                      </div>
                      {ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm nguyên liệu
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm mr-3">
                    2
                  </span>
                  Các bước thực hiện
                </h3>

                <div className="space-y-4">
                  {" "}
                  {steps.map((step, idx) => (
                    <div
                      key={`step-${idx}-${step.summary}`}
                      className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400"
                    >
                      {" "}
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tiêu đề bước (tuỳ chọn)"
                              value={step.summary}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Thời gian"
                              value={step.time}
                              className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-sm"
                            />
                          </div>
                          <textarea
                            placeholder="Mô tả chi tiết cách thực hiện..."
                            value={step.detail}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm"
                            rows={2}
                            required
                          />

                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {step.images &&
                                step.images.map((image, imageIdx) => (
                                  <div
                                    key={imageIdx}
                                    className="relative w-20 h-20"
                                  >
                                    <img
                                      alt={`Step ${idx + 1} image ${
                                        imageIdx + 1
                                      }`}
                                      className="w-full h-full object-cover rounded-md border border-gray-300"
                                    />
                                    <button
                                      type="button"
                                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}

                              {(!step.images || step.images.length < 4) && (
                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                  />
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                  <span className="text-xs text-gray-500 mt-1">
                                    {step.images?.length || 0}/4
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bước
                  </Button>
                </div>
              </div>
            </div>{" "}
          </div>
          <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
            <Button
              type="submit"
              className="px-8 py-3 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Chia sẻ công thức"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
