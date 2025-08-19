import {
  FaUserFriends,
  FaFire,
  FaNewspaper,
  FaUser,
  FaUtensils,
  FaPlus,
} from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { recipesService } from "../../../services/recipe.service";
import { toast } from "react-toastify";
import { getFollowers, isFollowing } from "../../../services/user.service";
import type { User } from "../../../types/auth.type";
import type { UserData } from "../../../types/user.type";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";

const DefaultRecipeImage = "https://cdn.loveandlemons.com/wp-content/uploads/2024/07/ratatouille.jpg";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface LeftSidebarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
}) => {
  const { user } = useAuth() as { user: User | null };
  const data = {
    menu: [
      { label: "Bài viết", icon: <FaNewspaper />, href: "/explore/posts" },
      { label: "Trang cá nhân", icon: <FaUser />, href: `/profile/${user?.id}` },
      { label: "Công thức của tôi", icon: <FaUtensils />, href: "/recipes/saved" },
    ] as MenuItem[],
  };

  return (
    <aside className="hidden lg:block w-72 pr-4 space-y-6 sticky top-24 h-fit">
      <div className="bg-white rounded-2xl shadow p-6 mb-2">
        {user && (
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user.avatar || DEFAULT_AVATAR_URL}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-800">
                {user.lastName} {user.firstName}
              </h3>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {data.menu.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  (item.label === "Bài viết" && activeTab === "posts")
                    ? "bg-[#F5F5F5] text-[#FF6363] font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="mt-6 w-full bg-[#FF6363] text-white py-3 rounded-xl font-semibold hover:bg-[#ff4f4f] transition flex items-center justify-center gap-2"
        >
          <FaPlus /> Tạo bài viết mới
        </button>
      </div>
    </aside>
  );
};


export const RightSidebar: React.FC = () => {
  const { user: currentUser } = useAuth() as { user: User };
  const [suggestFollow, setSuggestFollow] = useState<UserData[]>([]);
  const [hotDishs, setHotDishs] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (user: User) => {
      try {
        setIsLoading(true);
        
        const recipeIds = [
          999,
          1000,
        ];

        const usersPromises = getFollowers(user.username);
        const recipesPromises = recipeIds.map((id) => recipesService.getRecipeById(id));

        const responses = await Promise.all([
          usersPromises,
          ...recipesPromises,
        ]);

        const _isFollowing = await Promise.all(
          responses[0].map((user) => isFollowing(user.username))
        );

        const suggestFollowUsers = responses[0]
          .filter((_,i) => !_isFollowing[i])
          .slice(0, 5);

        const recipes = responses
          .slice(1,)
          .map((res: any) => res.recipe);
        
        setSuggestFollow(suggestFollowUsers);
        setHotDishs(recipes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentUser);
  }, [currentUser.id]);

  return (
    <aside className="hidden lg:block w-72 pl-4 space-y-6 sticky top-24 h-fit">
      <div className="bg-white rounded-2xl shadow p-6 mb-2">
        <div className="flex items-center mb-4 text-[#FF6363] font-bold text-lg">
          <FaUserFriends className="mr-2" /> Gợi ý theo dõi
        </div>
        {isLoading ? (
          <div className="text-center py-4">Đang tải...</div>
        ) : suggestFollow.length > 0 ? (
          <ul className="space-y-3">
            {suggestFollow.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || DEFAULT_AVATAR_URL}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#FF6363]"
                  />
                  <div className="flex flex-col">
                    <Link
                      to={`/profile/${user.id}`}
                      className="text-gray-700 font-medium text-sm hover:text-[#FFB800] transition-colors cursor-pointer"
                    >
                      {user.lastName + " " + user.firstName}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {user.followers} theo dõi
                    </span>
                  </div>
                </div>
                <button
                  className="ml-2 px-3 py-1 rounded-full text-xs font-semibold transition flex items-center justify-center bg-[#FF6363] text-white hover:bg-[#ff4f4f]"
                >
                  <MdLibraryAdd size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Không có gợi ý nào
          </div>
        )}
      </div>


      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center mb-4 text-[#FF6363] font-bold text-lg">
          <FaFire className="mr-2" /> Món ăn hot
        </div>
        {isLoading ? (
          <div className="text-center py-4">Đang tải...</div>
        ) : hotDishs.length > 0 ? (
          <ul className="space-y-3">
            {hotDishs.map((dish) => (
              <li key={dish.id} className="flex items-center gap-3">
                <Link
                  to={`/recipes/${dish.id}`}
                  className="flex flex-row gap-2 items-center hover:scale-105 transition-transform duration-200 w-full"
                >
                  <img
                    src={dish.image || DefaultRecipeImage}
                    alt={dish.title}
                    className="w-10 h-10 rounded object-cover border border-[#FF6363]"
                  />
                  <span className="text-gray-700 font-medium text-sm line-clamp-2 hover:text-[#FFB800] transition-colors cursor-pointer">
                    {dish.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Không có món ăn nào
          </div>
        )}
      </div>
    </aside>
  );
};