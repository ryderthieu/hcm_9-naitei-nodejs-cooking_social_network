import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import ProfileStats from "./ProfileStats";
import { FollowersPopup } from "../../popup";

interface ProfileHeaderProps {
  user: any;
  stats: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  activeTab?: string;
  onToggleFollow: () => void;
  onEditProfile: () => void;
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
  const [showFollowers, setShowFollowers] = useState<null | "followers" | "following">(null);

  const handleStatClick = (type: string) => {
    if (type === "posts" && onTabChange) {
      onTabChange("posts");
    } else if (type === "recipes" && onTabChange) {
      onTabChange("recipes");
    } else if (type === "followers") {
      setShowFollowers("followers");
    } else if (type === "following") {
      setShowFollowers("following");
    }
  };

  return (
    <>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-amber-100 to-yellow-100 relative">
        <div className="absolute -bottom-16 left-8">
          <div className="w-36 h-36 rounded-full border-4 border-white overflow-hidden bg-gray-200">
            <img
              src={user?.avatar || "/src/assets/avatar-default.svg"}
              alt={user?.firstName || "User"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8 px-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.bio && (
                <p className="text-base text-amber-600 font-medium">{user.bio}</p>
              )}
              {user?.createdAt && (
                <span className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                  <span>📅 Tham gia</span>
                  {(() => {
                    const date = new Date(user.createdAt);
                    if (!isNaN(date.getTime())) {
                      return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
                    }
                    return String(user.createdAt);
                  })()}
                </span>
              )}
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
                onClick={onEditProfile}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
        <div className="mt-2">
          <ProfileStats stats={stats} username={user?.username} />
        </div>
      </div>
    </div>
    <FollowersPopup
      isOpen={Boolean(showFollowers)}
      onClose={() => setShowFollowers(null)}
      username={user?.username as string}
      type={showFollowers === "followers" ? "followers" : "following"}
    />
    </>
  );
}
