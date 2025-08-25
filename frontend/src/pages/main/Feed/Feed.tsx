import { LeftSidebar, RightSidebar } from "../../../components/sections/Feed/Sidebar";
import PostList from "../../../components/Post/PostList";
import { useAuth } from "../../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import CreatePostModal from "../../../components/modals/Post/CreatePostModal";
import RecipesTab from "../../../components/sections/Profile/RecipesTab";


export default function Feed() {
  const { user, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePostCreated = () => {
    setShowCreateModal(false);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="flex bg-white rounded-2xl h-screen mb-6 font-medium justify-center items-center text-2xl">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderActiveTab = () => {
    if (!user) return null;

    switch (activeTab) {
      case "posts":
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bảng tin</h1>
              <p className="text-gray-600">
                Khám phá những món ăn ngon từ cộng đồng
              </p>
            </div>
            <PostList key={refreshKey} />
          </div>
        );
      case "recipes":
        return <RecipesTab username={user.username} />;
      default:
        return <PostList key={refreshKey} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-10 px-2 lg:px-8">
      <div className="max-w-7xl mx-auto flex gap-8 relative">
        <LeftSidebar activeTab={activeTab} onTabChange={setActiveTab} onAdd={() => setShowCreateModal(true)}/>

        <div className="flex-1">
          <div className="max-w-2xl mx-auto py-6 px-4">
            {renderActiveTab()}
          </div>
        </div>

        <div className="w-80 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24">
            <RightSidebar />
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDone={handlePostCreated}
      />
    </div>
  );
}
