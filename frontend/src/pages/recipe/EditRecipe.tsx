import { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { recipesService } from "../../services/recipe.service";
import { ingredientService } from "../../services/ingredient.service";
import { uploadFiles } from "../../services/upload.service";
import { AlertPopup } from "../../components/popup";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import CategoryModal from "../../components/modals/Recipe/CategoryModal";
import { getRecipeCategories } from "../../utils/enumMaps";
import type {
  UpdateRecipeDto,
  IngredientDto,
  StepDto,
  ImageDto,
  UtensilDto,
  IngredientListItem,
  FormIngredient,
  FormStep,
} from "../../types/recipe.type";

const generateUniqueId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

export default function EditRecipeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { alert, showError, showSuccess, closeAlert } = useAlertPopup();

  const { id } = useParams<{ id: string }>();

  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("1");
  const [cookingTime, setCookingTime] = useState("");
  const [ingredients, setIngredients] = useState<FormIngredient[]>([
    {
      id: generateUniqueId(),
      name: "",
      amount: "",
      unit: "",
      ingredientId: null,
    },
  ]);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<
    IngredientListItem[]
  >([]);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [steps, setSteps] = useState<FormStep[]>([
    {
      id: generateUniqueId(),
      summary: "",
      detail: "",
      time: "",
      images: [] as string[],
    },
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCategoryCount] = useState(5);
  const [categories, setCategories] = useState<
    { key: string; name: string; items: { _id: string; name: string }[] }[]
  >([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [units, setUnits] = useState<string[]>([]);
  const [ingredientSearchTimeout, setIngredientSearchTimeout] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  const STANDARD_UNIT_OPTIONS = [
    "g",
    "kg",
    "ml",
    "l",
    "cái",
    "quả",
    "lá",
    "nhánh",
    "thìa",
    "muỗng",
  ].map((u) => ({ value: u, label: u }));

  const getDynamicIngredientUnits = (currentIngredient: {
    unit: string;
    ingredientId: number | null;
  }) => {
    const base = [...STANDARD_UNIT_OPTIONS];
    if (
      currentIngredient?.unit &&
      currentIngredient.ingredientId &&
      !base.some((opt) => opt.value === currentIngredient.unit)
    ) {
      return [
        { value: currentIngredient.unit, label: currentIngredient.unit },
        ...base,
      ];
    }
    return base;
  };

  const openCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);

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

  const toggleCategory = (category: { _id: string; name: string }) => {
    setSelectedCategories((prev: any) =>
      prev.includes(category._id)
        ? prev.filter((id: string) => id !== category._id)
        : [...prev, category._id]
    );
  };

  const handleMainImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFiles([file]);
      if (result.length > 0) {
        setImagePreview(result[0].url);
        setUploadedImages([result[0].url]);
      }
    } catch (error) {
      showError("Không thể upload ảnh");
    }
  };

  const handleStepImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    stepIndex: number
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    try {
      const result = await uploadFiles(files);
      setSteps((prev) => {
        const next = [...prev];
        next[stepIndex] = {
          ...next[stepIndex],
          images: [
            ...(next[stepIndex].images as string[]),
            ...result.map((r) => r.url),
          ],
        };
        return next;
      });
    } catch (error) {
      showError("Không thể upload ảnh");
    }
  };

  const removeStepImage = (stepIndex: number, imageIndex: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next[stepIndex] = {
        ...next[stepIndex],
        images: (next[stepIndex].images as string[]).filter(
          (_, i) => i !== imageIndex
        ),
      };
      return next;
    });
  };

  const searchIngredients = async (query: string, index: number) => {
    if (!query.trim()) {
      setIngredientSuggestions([]);
      setActiveIngredientIndex(-1);
      return;
    }
    try {
      setIsSearching(true);
      setActiveIngredientIndex(index);
      const res = await ingredientService.getIngredients({ keyword: query });
      setIngredientSuggestions(res.ingredients || []);
    } catch (error) {
      setIngredientSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngredientNameChange = (index: number, value: string) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: value, ingredientId: null };
      return next;
    });
    if (ingredientSearchTimeout) clearTimeout(ingredientSearchTimeout);
    const timeoutId = setTimeout(() => searchIngredients(value, index), 200);
    setIngredientSearchTimeout(timeoutId);
  };

  const selectIngredient = (index: number, ingredient: IngredientListItem) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        name: ingredient.name,
        ingredientId: ingredient.id,
        unit: ingredient.unit || "",
      };
      return next;
    });
    setIngredientSuggestions([]);
    setActiveIngredientIndex(-1);
  };

  useEffect(() => {
    setCategories(getRecipeCategories());
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;

      try {
        const res = await recipesService.getRecipeById(Number(id));

        const recipe = res;

        if (!recipe) {
          showError("Không tìm thấy công thức");
          return;
        }

        setRecipeName(recipe.title ?? "");
        setDescription(recipe.description ?? "");
        setServings(recipe.servings?.toString() ?? "1");
        setCookingTime(recipe.time?.toString() ?? "");

        if (recipe.images?.length) {
          setImagePreview(recipe.images[0]?.imageUrl ?? "");
          setUploadedImages(
            recipe.images.map((img: any) => img.imageUrl ?? "")
          );
        } else {
          setImagePreview("");
          setUploadedImages([]);
        }

        setIngredients(
          (recipe.ingredients || []).map((ing: any) => ({
            id: generateUniqueId(),
            name: ing?.ingredient?.name ?? "",
            amount: ing?.quantity?.toString() ?? "",
            unit: ing?.unit ?? "",
            ingredientId: ing?.ingredientId ?? null,
          }))
        );

        setSteps(
          (recipe.steps || []).map((s: any) => ({
            id: generateUniqueId(),
            summary: s?.summary ?? s?.title ?? "",
            detail: s?.description ?? "",
            time: s?.time?.toString() ?? "",
            images: s?.image ? [s.image] : [],
          }))
        );

        const selectedCats: string[] = [];
        if (recipe.categories) {
          if (recipe.categories.mealType)
            selectedCats.push(recipe.categories.mealType);
          if (recipe.categories.cuisine)
            selectedCats.push(recipe.categories.cuisine);
          if (recipe.categories.occasions)
            selectedCats.push(recipe.categories.occasions);
          if (recipe.categories.dietaryPreferences)
            selectedCats.push(recipe.categories.dietaryPreferences);
          if (recipe.categories.mainIngredients)
            selectedCats.push(recipe.categories.mainIngredients);
          if (recipe.categories.cookingMethod)
            selectedCats.push(recipe.categories.cookingMethod);
          if (recipe.categories.timeBased)
            selectedCats.push(recipe.categories.timeBased);
          if (recipe.categories.difficultyLevel)
            selectedCats.push(recipe.categories.difficultyLevel);
        }
        setSelectedCategories(selectedCats);
      } catch (err) {
        showError("Không thể tải dữ liệu công thức");
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      showError("Vui lòng đăng nhập để chỉnh sửa công thức");
      return;
    }
    if (!recipeName.trim() || !description.trim()) {
      showError("Vui lòng điền đầy đủ tên và mô tả món ăn");
      return;
    }
    if (ingredients.some((ing) => !ing.name.trim() || !ing.amount.trim())) {
      showError("Vui lòng điền đầy đủ thông tin nguyên liệu");
      return;
    }
    if (steps.some((s) => !s.detail.trim())) {
      showError("Vui lòng điền đầy đủ các bước thực hiện");
      return;
    }

    try {
      setIsSubmitting(true);

      const validIngredients = ingredients.filter(
        (i) => i.name.trim() && i.amount.trim()
      );
      const processedIngredients: IngredientDto[] = [];
      for (const ing of validIngredients) {
        if (ing.ingredientId) {
          processedIngredients.push({
            ingredientId: ing.ingredientId,
            quantity: parseFloat(ing.amount) || 0,
            unit: ing.unit || "",
          });
        } else {
          try {
            const created = await ingredientService.createIngredient({
              name: ing.name.trim(),
              unit: ing.unit || "",
            });
            processedIngredients.push({
              ingredientId: created.ingredient.id,
              quantity: parseFloat(ing.amount) || 0,
              unit: ing.unit || "",
            });
          } catch (e: any) {
            const message = (e?.response?.data?.message || e?.message || "")
              .toString()
              .toLowerCase();
            if (
              message.includes("already exists") ||
              message.includes("unique") ||
              message.includes("slug")
            ) {
              try {
                const search = await ingredientService.getIngredients({
                  keyword: ing.name.trim(),
                  limit: 10,
                });
                const found = (search.ingredients || []).find(
                  (it: any) =>
                    (it.name || "").toString().toLowerCase() ===
                    ing.name.trim().toLowerCase()
                );
                if (found?.id) {
                  processedIngredients.push({
                    ingredientId: found.id,
                    quantity: parseFloat(ing.amount) || 0,
                    unit: ing.unit || found.unit || "",
                  });
                  continue;
                }
              } catch {}
            }
            showError(`Không thể tạo nguyên liệu: ${ing.name}`);
            return;
          }
        }
      }

      const validSteps = steps.filter((s) => s.detail.trim());
      const safeDescription = description.trim().slice(0, 180);

      const recipeData: UpdateRecipeDto = {
        title: recipeName.trim(),
        description: safeDescription,
        time: parseInt(cookingTime) || 0,
        ingredients: processedIngredients,
        steps: validSteps.map(
          (s): StepDto => ({
            description: s.detail.trim().slice(0, 180),
            image: (s.images as string[])[0],
          })
        ),
        images: uploadedImages.map((url): ImageDto => ({ imageUrl: url })),
        utensils: [] as UtensilDto[],
        categories: (() => {
          const categoriesData: any = {};
          selectedCategories.forEach((categoryId) => {
            categories.forEach((group) => {
              group.items.forEach((cat) => {
                if (cat._id === categoryId) {
                  categoriesData[group.key] = categoryId;
                }
              });
            });
          });
          return categoriesData;
        })(),
      };

      if (!id) {
        showError("Không tìm thấy ID công thức để cập nhật");
        return;
      }

      const resp = await recipesService.updateRecipe(Number(id), recipeData);
      showSuccess("Cập nhật công thức thành công!", {
        onConfirm: () => navigate(`/detail-recipe/${resp.recipe.id}`),
      });
    } catch (error) {
      showError("Không thể cập nhật công thức");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertPopup {...alert} onClose={closeAlert} />
      <div className="max-w-7xl mx-auto">
        <div className="py-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight">
            Chỉnh sửa công thức
          </h1>
          <p className="text-gray-800 mt-2">
            Cập nhật thông tin công thức nấu ăn của bạn
          </p>
        </div>

        <div className="">
          <form className="space-y-8" onSubmit={handleSubmit}>
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
                          onClick={() => {
                            setImagePreview(null);
                            setUploadedImages([]);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleMainImageUpload}
                        />
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
                    onChange={(e) => setDescription(e.target.value)}
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
                        onClick={() =>
                          setServings(
                            Math.max(1, parseInt(servings) - 1).toString()
                          )
                        }
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
                        onClick={() =>
                          setServings((parseInt(servings) + 1).toString())
                        }
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
                      .map((categoryId) => {
                        let categoryName = "Unknown";
                        categories.forEach((group) => {
                          group.items.forEach((cat) => {
                            if (cat._id === categoryId) {
                              categoryName = cat.name;
                            }
                          });
                        });
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
                      onClick={() => setShowCategoryModal(true)}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>{" "}
                  </div>{" "}
                  <CategoryModal
                    isOpen={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    categories={categories as any}
                    selectedCategories={selectedCategories as any}
                    onToggleCategory={(cat: any) => {
                      setSelectedCategories((prev: any) => {
                        if (prev.includes(cat._id)) {
                          return prev.filter((id: string) => id !== cat._id);
                        } else {
                          let categoryGroupKey = "";
                          categories.forEach((group) => {
                            if (
                              group.items.some((item) => item._id === cat._id)
                            ) {
                              categoryGroupKey = group.key;
                            }
                          });

                          const filtered = prev.filter((id: string) => {
                            return !categories.some(
                              (group) =>
                                group.key === categoryGroupKey &&
                                group.items.some((item) => item._id === id)
                            );
                          });

                          return [...filtered, cat._id];
                        }
                      });
                    }}
                    onClearAll={() => setSelectedCategories([] as any)}
                  />
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
                        key={ingredient.id}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                      >
                        {" "}
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Tên nguyên liệu"
                              value={ingredient.name}
                              onChange={(e) =>
                                handleIngredientNameChange(idx, e.target.value)
                              }
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
                                      key={suggestion.id}
                                      type="button"
                                      onClick={() =>
                                        selectIngredient(idx, suggestion)
                                      }
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex justify-between">
                                        <span>{suggestion.name}</span>
                                        {suggestion.unit && (
                                          <span className="text-gray-500 text-sm">
                                            {suggestion.unit}
                                          </span>
                                        )}
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
                            onChange={(e) => {
                              setIngredients((prevIngredients) => {
                                const newIngredients = [...prevIngredients];
                                newIngredients[idx] = {
                                  ...newIngredients[idx],
                                  amount: e.target.value,
                                };
                                return newIngredients;
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>{" "}
                        <div className="w-24">
                          <select
                            value={ingredient.unit}
                            onChange={(e) => {
                              setIngredients((prevIngredients) => {
                                const newIngredients = [...prevIngredients];
                                newIngredients[idx] = {
                                  ...newIngredients[idx],
                                  unit: e.target.value,
                                };
                                return newIngredients;
                              });
                            }}
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
                            {getDynamicIngredientUnits(ingredient).map(
                              (opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        {ingredients.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              setIngredients((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
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
                      onClick={() =>
                        setIngredients((prev) => [
                          ...prev,
                          {
                            id: generateUniqueId(),
                            name: "",
                            amount: "",
                            unit: "",
                            ingredientId: null,
                          },
                        ])
                      }
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
                        key={step.id}
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
                                onChange={(e) => {
                                  setSteps((prevSteps) => {
                                    const newSteps = [...prevSteps];
                                    newSteps[idx] = {
                                      ...newSteps[idx],
                                      summary: e.target.value,
                                    };
                                    return newSteps;
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Thời gian"
                                value={step.time}
                                onChange={(e) => {
                                  setSteps((prevSteps) => {
                                    const newSteps = [...prevSteps];
                                    newSteps[idx] = {
                                      ...newSteps[idx],
                                      time: e.target.value,
                                    };
                                    return newSteps;
                                  });
                                }}
                                className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-sm"
                              />
                            </div>
                            <textarea
                              placeholder="Mô tả chi tiết cách thực hiện..."
                              value={step.detail}
                              onChange={(e) => {
                                setSteps((prevSteps) => {
                                  const newSteps = [...prevSteps];
                                  newSteps[idx] = {
                                    ...newSteps[idx],
                                    detail: e.target.value,
                                  };
                                  return newSteps;
                                });
                              }}
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
                                        src={image}
                                        alt={`Step ${idx + 1} image ${
                                          imageIdx + 1
                                        }`}
                                        className="w-full h-full object-cover rounded-md border border-gray-300"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeStepImage(idx, imageIdx)
                                        }
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
                                      onChange={(e) =>
                                        handleStepImageUpload(e, idx)
                                      }
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
                              onClick={() =>
                                setSteps((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
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
                      onClick={() =>
                        setSteps((prev) => [
                          ...prev,
                          {
                            id: generateUniqueId(),
                            summary: "",
                            detail: "",
                            time: "",
                            images: [],
                          },
                        ])
                      }
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
                {isSubmitting ? "Đang tạo..." : "Cập nhật công thức"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
