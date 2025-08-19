import React from "react";
import { User, BookOpen, ChefHat, Bookmark } from "lucide-react";

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userData: any;
  userStats: any;
  isOwnProfile: boolean;
  user: any;
  stats: any;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onEditProfile: (formData: any) => void;
}

export default function ProfileSidebar({
  activeTab,
  onTabChange,
  userData,
  userStats,
  isOwnProfile,
  user,
  stats,
  isFollowing,
  onToggleFollow,
  onEditProfile,
}: ProfileSidebarProps) {
  const tabs = [
    {
      id: "posts",
      label: "Bài viết",
      icon: <BookOpen className="w-5 h-5" />,
      count: stats?.posts?.count || 0,
    },
    {
      id: "recipes",
      label: "Công thức",
      icon: <ChefHat className="w-5 h-5" />,
      count: stats?.recipes?.count || 0,
    },
  ];

  if (isOwnProfile) {
    tabs.push({
      id: "saved",
      label: "Đã lưu",
      icon: <Bookmark className="w-5 h-5" />,
      count: stats?.saved?.count || 0,
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">NỘI DUNG</h2>
      </div>

      <div className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
              activeTab === tab.id
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <span
                className={
                  activeTab === tab.id ? "text-amber-600" : "text-gray-500"
                }
              >
                {tab.icon}
              </span>
              <span className="font-medium">{tab.label}</span>
            </div>
            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {!isOwnProfile && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={onToggleFollow}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border transition-colors ${
              isFollowing
                ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                : "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="font-medium">
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </span>
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Giới thiệu</h3>
        <div className="space-y-2">
          {user?.bio && (
            <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
