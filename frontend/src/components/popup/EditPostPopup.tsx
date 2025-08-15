import { useState, useRef, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { ChefHat } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import type {
  PostEntity,
  PostMedia,
  PostRecipeRef,
} from "../../types/post.type";
import { updatePost } from "../../services/post.service";
import { AlertPopup } from "./index";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import RecipeSelectionModal from "./RecipeSelectionModal";
import type { RecipeListItem } from "../../services/recipe.service";
import { uploadFiles } from "../../services/upload.service";
import { getAccessToken } from "../../services/api.service";

interface EditPostPopupProps {
  post: PostEntity;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPost: PostEntity) => void;
}

export default function EditPostPopup({
  post,
  isOpen,
  onClose,
  onUpdate,
}: EditPostPopupProps) {
  const { alert, showError, showSuccess, closeAlert } = useAlertPopup();
  const [caption, setCaption] = useState(post.caption || "");
  const [media, setMedia] = useState<PostMedia[]>(post.media || []);
  const [newMedia, setNewMedia] = useState<{ file: File; preview: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<PostRecipeRef | null>(
    post.recipe || null
  );
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCaption(post.caption || "");
      setMedia(post.media || []);
      setNewMedia([]);
      setSelectedRecipe(post.recipe || null);
      setError(null);
      setUploadProgress(0);
    }
  }, [isOpen, post]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiObject: any) => {
    setCaption((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    const newMediaFiles = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewMedia((prev) => [...prev, ...newMediaFiles]);

    if (event.target) {
      event.target.value = "";
    }
  };

  const removeExistingMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewMedia = (index: number) => {
    setNewMedia((prev) => {
      const newArray = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return newArray;
    });
  };

  const handleRemoveRecipe = () => {
    setSelectedRecipe(null);
  };

  const handleAttachRecipe = () => {
    setShowRecipeModal(true);
  };

  const handleSelectRecipe = (recipe: RecipeListItem) => {
    setSelectedRecipe({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
    });
  };

  const uploadMediaToCloudinary = async (files: File[]) => {
    try {
      const uploadedMedia = await uploadFiles(files);
      return uploadedMedia;
    } catch (error) {
      console.error("Upload failed", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!caption.trim() && media.length === 0 && newMedia.length === 0) {
      setError("Vui lòng nhập nội dung hoặc thêm ảnh/video");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(10);

      let finalMedia = [...media];

      if (newMedia.length > 0) {
        const files = newMedia.map((item) => item.file);
        const uploadedMedia = await uploadMediaToCloudinary(files);
        setUploadProgress(50);

        const uploadedMediaItems: PostMedia[] = Array.isArray(uploadedMedia)
          ? uploadedMedia.map((item: any, index: number) => ({
              id: Date.now() + index,
              url: item.url || item.secure_url,
              type: (
                item.resourceType ||
                item.resource_type ||
                "image"
              ).toUpperCase() as "IMAGE" | "VIDEO",
              public_id: item.publicId || item.public_id,
            }))
          : [];

        finalMedia = [...finalMedia, ...uploadedMediaItems];
        setUploadProgress(80);
      }

      const updateData: any = {
        caption: caption.trim(),
        media: finalMedia,
      };

      if (selectedRecipe?.id) {
        updateData.recipeId = selectedRecipe.id;
      }

      const updatedPost = await updatePost(post.id, updateData);

      setUploadProgress(100);
      showSuccess("Chỉnh sửa bài viết thành công!", {
        onConfirm: () => {
          onUpdate(updatedPost.post);
          onClose();
        },
      });
    } catch (error) {
      const errorMessage = "Lỗi khi cập nhật bài viết";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const renderUploadProgress = () => {
    if (!uploadProgress || uploadProgress === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            Đang tải lên...
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800">
              Chỉnh sửa bài viết
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="px-8 py-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br rounded-full overflow-hidden">
                  <img
                    src={post.author.avatar || "/src/assets/avatar-default.svg"}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <span className="font-semibold text-gray-800">
                    {post.author.firstName} {post.author.lastName}
                  </span>
                  <p className="text-sm text-gray-500">Đăng công khai</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nội dung
                </label>
                <div className="relative">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Nhập nội dung bài viết..."
                    className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-500/20 transition-all resize-none"
                  />
                  <button
                    onClick={toggleEmojiPicker}
                    className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <FaceSmileIcon className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute top-full right-0 mt-2 z-10"
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={300}
                        height={400}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedRecipe && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Công thức đã chọn
                  </label>
                  <div className="flex items-center bg-orange-50 text-orange-700 px-4 py-3 rounded-xl">
                    <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center mr-3">
                      <ChefHat className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedRecipe?.title}</h4>
                      <p className="text-sm text-orange-600/70">
                        Chưa có độ khó
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveRecipe}
                      className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-gray-700 text-sm font-medium mb-4">
                  Hình ảnh/Video
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {media.map((item, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group aspect-square"
                    >
                      {item.type === "IMAGE" ? (
                        <img
                          src={item.url}
                          alt={`media-${index}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover rounded-xl"
                          controls
                        />
                      )}
                      <button
                        onClick={() => removeExistingMedia(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {newMedia.map((item, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group aspect-square"
                    >
                      {item.file.type.startsWith("image/") ? (
                        <img
                          src={item.preview}
                          alt={`new-${index}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <video
                          src={item.preview}
                          className="w-full h-full object-cover rounded-xl"
                          controls
                        />
                      )}
                      <button
                        onClick={() => removeNewMedia(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-2">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Thêm ảnh/video
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                <span className="text-sm font-medium text-gray-600">
                  Thêm vào bài viết
                </span>
                <button
                  onClick={handleAttachRecipe}
                  className="p-2 hover:bg-white rounded-lg transition-colors flex items-center gap-2 text-orange-600"
                >
                  <ChefHat className="w-5 h-5" />
                  <span className="text-sm font-medium">Gắn công thức</span>
                </button>
              </div>

              {renderUploadProgress()}

              {error && (
                <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    loading ||
                    (!caption.trim() &&
                      media.length === 0 &&
                      newMedia.length === 0)
                  }
                  className={`px-6 py-2.5 rounded-xl transition-colors ${
                    loading ||
                    (!caption.trim() &&
                      media.length === 0 &&
                      newMedia.length === 0)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </div>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipeSelectionModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSelect={handleSelectRecipe}
      />
      <AlertPopup
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        showCancel={alert.showCancel}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onClose={closeAlert}
      />
    </>
  );
}
