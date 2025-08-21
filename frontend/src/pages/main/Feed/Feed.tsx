import { LeftSidebar, RightSidebar } from "../../../components/sections/Feed/Sidebar";
import PostList from "../../../components/Post/PostList";
import { useAuth } from "../../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Feed() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-10 px-2 lg:px-8">
      <div className="max-w-7xl mx-auto flex gap-8 relative">
        <LeftSidebar activeTab="posts"/>

        <div className="flex-1">
          <div className="max-w-2xl mx-auto py-6 px-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bảng tin</h1>
              <p className="text-gray-600">
                Khám phá những món ăn ngon từ cộng đồng
              </p>
            </div>

            <PostList />
          </div>
        </div>

        <div className="w-80 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
