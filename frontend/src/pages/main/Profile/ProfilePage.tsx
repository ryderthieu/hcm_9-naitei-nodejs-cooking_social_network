import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getUserByUsername,
  getUserStats,
  toggleFollow,
  updateUserProfile,
} from "../../../services/user.service";

import { showErrorAlert, showSuccessAlert } from "../../../utils/errorHandler";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileHeader from "../../../components/sections/Profile/ProfileHeader";
import ProfileSidebar from "../../../components/sections/Profile/ProfileSidebar";
import PostsTab from "../../../components/sections/Profile/PostsTab";
import RecipesTab from "../../../components/sections/Profile/RecipesTab";
import SavedContent from "../../../components/sections/Profile/SavedContent";
import EditProfileModal from "../../../components/sections/Profile/EditProfileModal";
import type { UserData, UserStats, UserProfile } from "../../../types/user.type";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("posts");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const currentUsername = currentUser?.username;

  const targetUsername = username;
  const isOwnProfile = currentUsername === targetUsername;

  useEffect(() => {
    const fetchData = async () => {
      if (!targetUsername) return;

      try {
        setIsLoading(true);

        const userResponse = await getUserByUsername(targetUsername);

        if (userResponse) {
          setUserData(userResponse);

          if (isOwnProfile) {
            setIsFollowing(false);
          } else {
            setIsFollowing(userResponse.isFollowing || false);
          }

          const stats = {
            posts: { count: userResponse.postsCount || 0 },
            recipes: { count: userResponse.recipesCount || 0 },
            saved: { count: userResponse.savedPostsCount || 0 },
            followers: { count: userResponse.followers || 0 },
            following: { count: userResponse.followings || 0 },
          };
          setUserStats(stats);
        } else {
          console.error("No user response received");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        showErrorAlert(error, "Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [targetUsername, currentUsername]);

  const handleToggleFollow = async () => {
    if (!targetUsername || !currentUser) {
      showErrorAlert(null, "Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    try {
      const willFollow = !isFollowing;
      setIsFollowing(willFollow);
      await toggleFollow(targetUsername);

      const updatedUserResponse = await getUserByUsername(targetUsername);
      if (updatedUserResponse) {
        const updatedStats = {
          posts: { count: updatedUserResponse.postsCount || 0 },
          recipes: { count: updatedUserResponse.recipesCount || 0 },
          saved: { count: updatedUserResponse.savedPostsCount || 0 },
          followers: { count: updatedUserResponse.followers || 0 },
          following: { count: updatedUserResponse.followings || 0 },
        };
        setUserStats(updatedStats);
      }

      showSuccessAlert(
        willFollow
          ? `Đã theo dõi ${userData?.firstName || "người dùng"}`
          : `Đã hủy theo dõi ${userData?.firstName || "người dùng"}`
      );
    } catch (error) {
      setIsFollowing(!isFollowing);
      showErrorAlert(error, "Không thể thực hiện thao tác");
    }
  };

  const handleEditProfile = async (formData: UserProfile) => {
    try {
      const updatedUser = await updateUserProfile(formData);
      setUserData(updatedUser);
      setIsEditModalOpen(false);
      showSuccessAlert("Cập nhật hồ sơ thành công!");
    } catch (error) {
      showErrorAlert(error, "Không thể cập nhật hồ sơ");
    }
  };

  const handleMessage = (targetUsername: string) => {
    if (!currentUser) {
      showErrorAlert(null, "Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl h-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl h-96"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không tìm thấy người dùng
          </h2>
          <p className="text-gray-600">
            Người dùng này không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    if (!targetUsername) return null;

    switch (activeTab) {
      case "posts":
        return <PostsTab username={targetUsername} />;
      case "recipes":
        return <RecipesTab username={targetUsername} />;
      case "saved":
        return <SavedContent username={targetUsername} />;
      default:
        return <PostsTab username={targetUsername} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProfileHeader
          user={userData}
          stats={userStats}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          activeTab={activeTab}
          onToggleFollow={handleToggleFollow}
          onEditProfile={() => setIsEditModalOpen(true)}
          onMessage={handleMessage}
          onTabChange={setActiveTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userData={userData}
                userStats={userStats}
                isOwnProfile={isOwnProfile}
                user={userData}
                stats={userStats}
                isFollowing={isFollowing}
                onToggleFollow={handleToggleFollow}
                onEditProfile={() => setIsEditModalOpen(true)}
              />
            </div>
          </div>

          <div className="lg:col-span-6">{renderActiveTab()}</div>

          <div className="hidden lg:block lg:col-span-3">
            <div className="h-full rounded-2xl"></div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditProfile}
        user={userData as Partial<UserProfile>}
      />
    </div>
  );
}
