import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image,
  Plus,
  Search,
  User,
  Settings,
  ChefHat,
  Smile,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { createPost } from "../../../services/post.service";
import { recipesService } from "../../../services/recipe.service";
import { toast } from "react-toastify";
import type { Recipe } from "../../../types/recipe.type";
import { uploadFiles, type UploadResult } from "../../../services/upload.service";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";
import EmojiPicker from "emoji-picker-react";


interface MediaItem {
  file: File;
  preview: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onDone,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState<string>("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);
  const [recipeSearch, setRecipeSearch] = useState<string>("");
  const [recipeTab, setRecipeTab] = useState<"system" | "personal">("system");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isShowIconPicker, setIsShowIconPicker] = useState(false);


  useEffect(() => {
    if (!showRecipeModal) return;

    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const data =
          recipeTab === "personal"
            ? await recipesService.getRecipesByUser(user?.username ?? "")
            : await recipesService.getRecipes();

        const recipes = recipeTab === "personal" ? data : data?.recipes;

        setRecipes(recipes ?? []);
        if (!recipes || recipes.length === 0) {
          toast.error("Không tìm thấy công thức nào");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Không thể tải danh sách công thức");
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [recipeTab, showRecipeModal, user?.username]);


  useEffect(() => {
    const searchRecipesDebounced = async () => {
      if (!recipeSearch.trim()) {
        const data = 
          recipeTab === "personal" 
          ? await recipesService.getRecipesByUser(user?.username ?? "")
          : await recipesService.getRecipes();
        
        const recipes = recipeTab === "personal" ? data : data?.recipes;
        setRecipes(recipes ?? []);
        return;
      }

      setIsLoadingRecipes(true);
      try {
        const data = 
          recipeTab === "personal"
          ? await recipesService.getRecipesByUser(user?.username ?? "")
          : await recipesService.getRecipes({name: recipeSearch});

        const recipes = 
          recipeTab === "personal" 
          ? data.filter((recipe: Recipe) => 
              recipe.title.toLowerCase().replace(/\s+/g, "").includes(
                recipeSearch.toLowerCase().replace(/\s+/g, "")
              )
            )
          : data?.recipes;
        
        setRecipes(recipes ?? [])
      } catch (error) {
        console.error("Error searching recipes:", error);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    const timeoutId = setTimeout(searchRecipesDebounced, 500);
    return () => clearTimeout(timeoutId);
  }, [recipeSearch, recipeTab, user?.username]);

  const handleEmojiSelect = (emoji: string) => {
    setContent(prevContent => prevContent + emoji);
    setIsShowIconPicker(false);
  };

  const renderUploadProgress = () => {
    if (!isLoading || uploadProgress === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            "Đang tải ảnh lên..."
          </span>
          <span className="text-sm font-medium text-orange-600">
            {uploadProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    );
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newMedia = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setMedia((prevMedia) => {
        const updatedMedia = [...prevMedia, ...newMedia];
        return updatedMedia.slice(0, 5);
      });
  };

  const removeMedia = (index: number) => {
    setMedia((prevMedia) => {
      const newMedia = [...prevMedia];
      URL.revokeObjectURL(newMedia[index].preview);
      newMedia.splice(index, 1);
      return newMedia;
    });
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipes([recipe]);
    setShowRecipeModal(false);
  };

  const removeRecipe = () => {
    setSelectedRecipes([]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedImages = media.length > 0 
        ? (await uploadFiles(media.map((item) => item.file))) 
        : [];
      
      const images: string[] = uploadedImages.map((v: UploadResult) => v.url);

      const postData = {
        caption: content,
        recipeId: selectedRecipes[0].id,
        mediaUrls: images,
      };

      await createPost(postData);
      onDone();
      toast.success("Đã tạo bài viết thành công!");

      onClose();
      setContent("");
      setMedia([]);
      setSelectedRecipes([]);
      setUploadProgress(0);
    } catch (error: any) {
      console.error("Error creating post/video:", error);
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi đăng bài"
      );
      setError(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi đăng bài"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-800">Tạo bài viết mới</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex py-2 px-4 font-medium items-center justify-center transition-all bg-orange-50 rounded-xl p-1 text-orange-600 shadow-sm">
              Bài viết
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br rounded-full overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar}
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <span className="font-semibold text-gray-800">
                  {user ? `${user.firstName} ${user.lastName}` : 'Người dùng'}
                </span>
                <p className="text-sm text-gray-500">Đăng công khai</p>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full h-32 p-4 border border-gray-200 rounded-xl mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 pr-10"
              />
              <div className="absolute right-4 top-4">
                <button
                  className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => setIsShowIconPicker(!isShowIconPicker)}
                >
                  <Smile size={20} />
                </button>

                {isShowIconPicker && (
                  <>
                    <div
                      className="fixed inset-0 bg-transparent z-50"
                      onClick={() => setIsShowIconPicker(false)}
                    />
                    <div className="absolute z-50 top-full right-0 mt-2">
                      <div className="bg-white border rounded-lg shadow-2xl">
                        <EmojiPicker
                          onEmojiClick={(data) => handleEmojiSelect(data.emoji)}
                          width={300}
                          height={400}
                          searchDisabled={false}
                          skinTonesDisabled={true}
                          previewConfig={{
                            showPreview: false,
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            
            {selectedRecipes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Công thức đã chọn:</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                    <img 
                      src={selectedRecipes[0].images[0]?.imageUrl || DEFAULT_AVATAR_URL} 
                      alt={selectedRecipes[0].title} 
                      className="w-6 h-6 rounded-full mr-2" 
                    />
                    <span>{selectedRecipes[0].title}</span>
                    <button
                      type="button"
                      onClick={removeRecipe}
                      className="ml-2 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            
            {media.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {media.map((item, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {media.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-orange-500 transition-colors"
                  >
                    <Plus size={24} className="text-gray-400" />
                  </button>
                )}
              </div>
            )}

            
            <div className="flex items-center justify-between mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <span className="text-sm font-medium text-gray-600">Thêm vào bài viết</span>
              <div className="flex gap-3">
                {(!media.length || media.length < 5) && 
                    (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Thêm ảnh"
                  >
                    <Image size={20} className="text-green-600" />
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(true)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Gắn công thức"
                >
                  <ChefHat size={20} className="text-orange-600" />
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaChange}
              accept={"image/*"}
              multiple={true}
              className="hidden"
            />

            {renderUploadProgress()}

            {error && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !content.trim() || selectedRecipes.length === 0}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                isLoading || !content.trim() || selectedRecipes.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang tạo bài viết...
                </div>
              ) : (
                'Đăng bài'
              )}
            </button>   
          </div>
        </div>
      </div>

      
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Chọn công thức</h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setRecipeTab('system')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    recipeTab === 'system' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  <Settings size={16} className="inline mr-1" />
                  Hệ thống
                </button>
                <button
                  onClick={() => setRecipeTab('personal')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    recipeTab === 'personal' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  <User size={16} className="inline mr-1" />
                  Của tôi
                </button>
              </div>
            </div>

            
            <div className="px-6 py-3">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Tìm kiếm công thức..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            
            <div className="px-6 pb-4 max-h-80 overflow-y-auto">
              {isLoadingRecipes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleRecipeSelect(recipe)}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <img
                      src={recipe.images[0]?.imageUrl || DEFAULT_AVATAR_URL}
                      alt={recipe.title}
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{recipe.title}</h4>
                      <p className="text-sm text-gray-500">
                        {recipe.categories?.difficultyLevel || 'Chưa có độ khó'}
                      </p>
                    </div>
                    {selectedRecipes.find(r => r.id === recipe.id) && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Plus size={16} className="text-white rotate-45" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {recipeSearch.trim() 
                    ? 'Không tìm thấy công thức phù hợp'
                    : 'Chưa có công thức nào'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostModal;
