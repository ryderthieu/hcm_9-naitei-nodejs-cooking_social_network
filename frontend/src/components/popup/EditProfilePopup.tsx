import React, { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import type { UserProfile } from "../../types/user.type";
import { updateUserProfile } from "../../services/user.service";
import { uploadFiles } from "../../services/upload.service";
import { AlertPopup } from "./index";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { useAlertPopup } from "../../hooks/useAlertPopup";

interface EditProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser: Partial<UserProfile> | null;
  onUpdated?: (updatedUser: any) => void;
}

export default function EditProfilePopup({ isOpen, onClose, initialUser, onUpdated }: EditProfilePopupProps) {
  const { alert, showSuccess, showError, closeAlert } = useAlertPopup();
  const [formData, setFormData] = useState<UserProfile>({
    firstName: initialUser?.firstName || "",
    lastName: initialUser?.lastName || "",
    bio: initialUser?.bio || "",
    avatar: initialUser?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      firstName: initialUser?.firstName || "",
      lastName: initialUser?.lastName || "",
      bio: initialUser?.bio || "",
      avatar: initialUser?.avatar || "",
    });
  }, [isOpen, initialUser]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile(formData);
      onUpdated?.(updated);
      showSuccess("Cập nhật hồ sơ thành công!", { onConfirm: onClose });
    } catch (error) {
      showError("Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploadResults = await uploadFiles(Array.from(files));
      if (uploadResults && uploadResults.length > 0) {
        const url = uploadResults[0].url;
        if (url) {
          setFormData(prev => ({ ...prev, avatar: url }));
        }
      }
    } catch (error) {
      showError('Tải ảnh không thành công');
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-yellow-600/10"
        style={{ animation: "popup 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold mb-6 text-gray-800">Chỉnh sửa hồ sơ</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={formData.avatar || DEFAULT_AVATAR_URL}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow"
                title="Tải ảnh"
              >
                <Camera className="w-4 h-4" />
              </button>
              {formData.avatar && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar: "" }))}
                  className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Họ"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Tên"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
            />
          </div>

          <div className="relative">
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={4}
              placeholder="Giới thiệu..."
              className="w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
            />
            <div className="absolute right-2 top-2">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowEmoji((prev) => !prev)}
                title="Thêm emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmoji && (
                <div className="absolute left-full top-0 ml-2 z-20">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setFormData((prev) => ({ ...prev, bio: prev.bio + emojiObject.emoji }));
                      setShowEmoji(false);
                    }}
                    width={280}
                    height={350}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
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
    </div>
  );
}
