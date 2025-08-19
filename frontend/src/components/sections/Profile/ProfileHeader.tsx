import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

interface ProfileHeaderProps {
  user: any;
  stats: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  activeTab?: string;
  onToggleFollow: () => void;
  onEditProfile: (formData: any) => void;
  onMessage: (username: string) => void;
  onTabChange?: (tab: string) => void;
}

export default function ProfileHeader({
  user,
  stats,
  isOwnProfile,
  isFollowing,
  activeTab,
  onToggleFollow,
  onEditProfile,
  onMessage,
  onTabChange,
}: ProfileHeaderProps) {
  const navigate = useNavigate();

  const handleStatClick = (type: string) => {
    if (type === "posts" && onTabChange) {
      onTabChange("posts");
    } else if (type === "recipes" && onTabChange) {
      onTabChange("recipes");
    } else if (type === "followers") {
    } else if (type === "following") {
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-amber-100 to-yellow-100 relative">
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
            <img
              src={user?.avatar || "/src/assets/avatar-default.svg"}
              alt={user?.firstName || "User"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="pt-20 pb-6 px-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.bio && (
                <p className="text-lg text-amber-600 font-medium">{user.bio}</p>
              )}
            </div>

            <div className="flex items-center space-x-8">
              <div
                className="text-center cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => handleStatClick("posts")}
              >
                <div className="text-xl font-bold text-gray-900">
                  {stats?.posts?.count || 0}
                </div>
                <div className="text-sm text-gray-600">Bài đăng</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => handleStatClick("recipes")}
              >
                <div className="text-xl font-bold text-gray-900">
                  {stats?.recipes?.count || 0}
                </div>
                <div className="text-sm text-gray-600">Công thức</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => handleStatClick("followers")}
              >
                <div className="text-xl font-bold text-gray-900">
                  {stats?.followers?.count || 0}
                </div>
                <div className="text-sm text-gray-600">Người theo dõi</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => handleStatClick("following")}
              >
                <div className="text-xl font-bold text-gray-900">
                  {stats?.following?.count || 0}
                </div>
                <div className="text-sm text-gray-600">Đang theo dõi</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-6">
            {!isOwnProfile && (
              <>
                <button
                  onClick={() => onMessage(user.username)}
                  className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </button>
                <button
                  onClick={onToggleFollow}
                  className={`px-6 py-2 rounded-lg border transition-colors ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      : "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </>
            )}
            {isOwnProfile && (
              <button
                onClick={() => onEditProfile(user)}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
