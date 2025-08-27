import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserByUsername, toggleFollow } from "../../../services/user.service";

import { AlertPopup } from "../../../components/popup";
import { useAlertPopup } from "../../../hooks/useAlertPopup";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileHeader from "../../../components/sections/Profile/ProfileHeader";
import ProfileSidebar from "../../../components/sections/Profile/ProfileSidebar";
import PostsTab from "../../../components/sections/Profile/PostsTab";
import RecipesTab from "../../../components/sections/Profile/RecipesTab";
import SavedContent from "../../../components/sections/Profile/SavedContent";
import { EditProfilePopup } from "../../../components/popup";
import type { UserData, UserStats, UserProfile } from "../../../types/user.type";
import { getConversations, createConversation } from "../../../services/conversation.service";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { alert, showError, showInfo, closeAlert } = useAlertPopup();

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
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [targetUsername, currentUsername]);

  const handleToggleFollow = async () => {
    if (!targetUsername || !currentUser) {
      showInfo("Vui lòng đăng nhập để thực hiện thao tác này", {
        onConfirm: () => navigate("/auth/login"),
      });
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

    } catch (error) {
      setIsFollowing(!isFollowing);
      showError("Không thể thực hiện thao tác");
    }
  };

  const handleStatsChange = (type: 'followers' | 'following', count: number) => {
    setUserStats(prevStats => {
      if (!prevStats) return prevStats;
      return {
        ...prevStats,
        [type]: { count }
      };
    });
  };

  const handleMessage = async (targetUsername: string) => {
    if (!currentUser) {
      showInfo("Vui lòng đăng nhập để thực hiện thao tác này", {
        onConfirm: () => navigate("/auth/login"),
      });
      return;
    }
    try {
      const conversationsResponse = await getConversations();
      const conversations = conversationsResponse?.conversations || conversationsResponse || [];
      const existing = conversations.find((c: any) => Array.isArray(c.members) && c.members.some((m: any) => m.username === targetUsername));
      if (existing?.id) {
        navigate(`/messages/${existing.id}`);
        return;
      }

      const target = await getUserByUsername(targetUsername);
      if (!target?.id) {
        navigate("/messages");
        return;
      }
      const payload = { members: [target.id], name: `${target.firstName} ${target.lastName}`, avatar: target.avatar };
      const created = await createConversation(payload);
      if (created?.conversation?.id) {
        navigate(`/messages/${created.conversation.id}`);
      } else {
        navigate("/messages");
      }
    } catch (e) {
      navigate("/messages");
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-[88px] h-fit max-h-[calc(100vh-88px)] self-start">
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
          <div className="lg:col-span-6 space-y-6">
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
              onStatsChange={handleStatsChange}
            />
            {renderActiveTab()}
          </div>
          <div className="hidden lg:block lg:col-span-3">
            <div className="h-full rounded-2xl"></div>
          </div>
        </div>
      </div>

      <EditProfilePopup
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialUser={userData as Partial<UserProfile>}
        onUpdated={(updated) => setUserData(updated)}
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
    </div>
  );
}
