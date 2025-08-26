import React, { useState, useEffect } from "react";
import { FaSearch, FaNewspaper, FaBook, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { searchUsers } from "../../../services/user.service";
import type { User } from "../../../types/auth.type";
import { PostList } from "../../../components/Post";
import RecipeGrid from "../../../components/sections/Recipe/RecipeGrid";
import UserCard from "../../../components/common/user/UserCard";

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSearchQuery, setPageSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"posts" | "recipes" | "users">("posts");

  const navigate = useNavigate();
  const location = useLocation();

  const [userResult, setUserResult] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get("q") || "";
    const filterFromUrl = (params.get("filter") as "posts" | "recipes" | "users") || "posts";

    setSearchQuery(queryFromUrl);
    setPageSearchQuery(queryFromUrl);
    setActiveFilter(filterFromUrl);
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery) {
        setUserResult([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (activeFilter !== "users") return;
        const userData = await searchUsers(searchQuery);
        setUserResult(userData);
      } catch (err: any) {
        console.error("Search API error:", err);
        setError(err.message || "Đã có lỗi xảy ra khi tìm kiếm.");
        setUserResult([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, activeFilter]);

  const updateUrlParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(location.search);
    Object.keys(newParams).forEach((key) => {
      if (newParams[key]) {
        params.set(key, newParams[key]);
      } else {
        params.delete(key);
      }
    });
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handlePageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: pageSearchQuery });
  };

  const handleActiveFilterChange = (newFilter: "posts" | "recipes" | "users") => {
    updateUrlParams({ filter: newFilter, q: searchQuery });
  };

  const renderResults = () => {
    if (loading)
      return <p className="text-center text-gray-600">Đang tải kết quả...</p>;
    if (error)
      return <p className="text-center text-red-500">Lỗi: {error}</p>;
    if (!searchQuery)
      return (
        <p className="text-center text-gray-500">
          Nhập từ khóa để bắt đầu tìm kiếm.
        </p>
      );

    switch (activeFilter) {
      case "posts":
        return <PostList filter={{ keyword: searchQuery }} />;

      case "recipes":
        return (
          <div
            className="
              [&>div>div]:grid
              [&>div>div]:[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]
              [&>div>div]:gap-6
              [&>div>div]:md:gap-8
            "
          >
            <RecipeGrid title="" initialQuery={{ name: searchQuery }} />
          </div>
        );

      case "users":
        if (userResult.length === 0)
          return (
            <p className="text-center text-gray-500">
              Không tìm thấy người dùng nào.
            </p>
          );
        return (
          <div className="space-y-4">
            {userResult?.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        );

      default:
        return (
          <p className="text-center text-gray-500">
            Chọn một bộ lọc để xem kết quả.
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 px-[110px] flex justify-center">
        <div
          className="w-full rounded-3xl shadow-lg px-8 py-10"
          style={{
            background:
              "linear-gradient(30deg, rgba(246,60,60,0.9) 0%, rgba(255,175,1,0.75) 50%, rgba(255,225,1,0.6) 100%)",
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Tìm kiếm
          </h1>
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handlePageSearchSubmit} className="relative">
              <input
                type="text"
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, công thức, người dùng..."
                className="w-full px-6 py-4 rounded-xl border-2 border-white/30 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-lg text-lg placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#FFB800] hover:text-[#E6A600] transition-colors"
              >
                <FaSearch size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="py-8 px-[110px]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <div className="space-y-3">
                  <button
                    onClick={() => handleActiveFilterChange("posts")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeFilter === "posts"
                        ? "bg-[#FFF4D6] text-[#FFB800] shadow-md border border-[#FFB800]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <FaNewspaper size={20} />
                    <span>Bài viết</span>
                  </button>

                  <button
                    onClick={() => handleActiveFilterChange("recipes")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeFilter === "recipes"
                        ? "bg-[#FFF4D6] text-[#FFB800] shadow-md border border-[#FFB800]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <FaBook size={20} />
                    <span>Công thức</span>
                  </button>

                  <button
                    onClick={() => handleActiveFilterChange("users")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeFilter === "users"
                        ? "bg-[#FFF4D6] text-[#FFB800] shadow-md border border-[#FFB800]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <FaUser size={20} />
                    <span>Người dùng</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 min-h-[300px]">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="text-[#FFB800] mr-2">Kết quả tìm kiếm</span>
                  {searchQuery && (
                    <span className="text-gray-600">cho "{searchQuery}"</span>
                  )}
                </h2>
                {renderResults()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
