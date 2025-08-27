import { useState, useRef, useEffect } from "react";
import logo from "../../assets/logo.svg";
import avatarDefault from "../../assets/avatar-default.svg";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import NotificationDropdown from "../sections/NotificationDropdown";
import MessageDropdown from "../sections/MessageDropdown";
import { useAuth } from "../../contexts/AuthContext";

type CategoryItem = {
  name: string;
  path?: string;
  image?: string;
  count?: number;
};

type Category = {
  name: string;
  items: CategoryItem[];
  background?: string;
};

const Header = () => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setActive(0);
    } else if (path.startsWith("/")) {
      setActive(1);
    } else if (path.startsWith("/community-recipes")) {
      setActive(2);
    } else if (path.startsWith("/support")) {
      setActive(3);
    } else if (path.startsWith("/search")) {
      setActive(4);
    } else setActive(-1);
  }, [location]);

  return (
    <div className="flex justify-between items-center px-[110px] py-[20px] fixed bg-white z-50 right-0 left-0">
      <a href="/">
        <img src={logo} alt="Oshisha" className="h-9 w-auto" />
      </a>
      <div className="flex items-center gap-10" ref={navRef}>
        <a
          href="/"
          onClick={() => {
            setIsExploreOpen(false);
            setIsSearchOpen(false);
            setIsSupportOpen(false);
          }}
          className={`flex cursor-pointer relative items-center transition-all duration-300 ${
            active == 0 ? "text-[#FF6363]" : "text-[#211E2E]"
          }`}
        >
          <p className="font-semibold text-[17px] transform scale-y-[1.05] relative">
            Trang chủ
          </p>
        </a>

        <a
          href="/community-recipes"
          onClick={() => {
            setIsExploreOpen(!isExploreOpen);
            setIsSearchOpen(false);
            setIsSupportOpen(false);
          }}
          className={`flex cursor-pointer relative items-center ${
            active == 1 ? "text-[#FF6363]" : "text-[#211E2E]"
          }`}
        >
          <p className="font-semibold text-[17px] leading-[1.2] scale-y-[1.05]">
            Công thức
          </p>
        </a>

        <a
          href="/about"
          onClick={() => {
            setIsExploreOpen(false);
            setIsSearchOpen(false);
            setIsSupportOpen(false);
          }}
          className={`flex cursor-pointer relative items-center ${
            active == 2 ? "text-[#FF6363]" : "text-[#211E2E]"
          }`}
        >
          <p className="font-semibold text-[17px] transform scale-y-[1.05]">
            Về OSHISHA
          </p>
        </a>

        <a
          href="/support"
          onClick={() => {
            setIsSupportOpen(!isSupportOpen);
            setIsSearchOpen(false);
            setIsExploreOpen(false);
          }}
          className={`flex cursor-pointer relative items-center ${
            active == 3 ? "text-[#FF6363]" : "text-[#211E2E]"
          }`}
        >
          <p className="font-semibold text-[17px] transform scale-y-[1.05]">
            Hỗ trợ
          </p>
        </a>
      </div>

      <div ref={dropdownRef} className="flex items-center">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center transition-all duration-300 ease-in-out ${
              isSearchOpen ? "w-[300px]" : "w-10"
            }`}
            ref={searchRef}
          >
            {isSearchOpen ? (
              <div className="flex items-center w-full bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-[#FF6363] focus-within:shadow-md transition-all duration-200">
                <a href="/search">
                  <IoSearchOutline className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                </a>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter")
                      navigate(`/search?q=${searchQuery}`);
                  }}
                />
                <div
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer ml-2"
                >
                  <FaTimes className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ) : (
              <div
                className="rounded-full p-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
              >
                <IoSearchOutline className="w-6 h-6 text-slate-700" />
              </div>
            )}
          </div>

          <div>
            <NotificationDropdown />
          </div>

          <div>
            <MessageDropdown />
          </div>

          <div
            className="relative cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || avatarDefault}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#FFB800]"
                alt="User avatar"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[20px] h-[20px] bg-[#E2E5E9] rounded-full flex items-center justify-center text-[12px]">
              <FaChevronDown
                className={`text-center text-white transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute top-[80px] right-[100px] bg-white rounded-b-lg w-[200px] shadow-2xl z-10 overflow-hidden">
              <div className="p-4">
                <a
                  onClick={() => {
                    navigate(`/profile/${user?.username}`);
                    setIsDropdownOpen(false);
                  }}
                  className="block text-[#04043F] font-medium text-[16px] py-2 px-4 rounded-lg cursor-pointer hover:bg-[#f9f9f9] hover:text-[#FF6363] transition-all duration-200"
                >
                  Trang cá nhân
                </a>
                <div
                  onClick={() => {
                    navigate("/account");
                    setIsDropdownOpen(false);
                  }}
                  className="block text-[#04043F] font-medium text-[16px] py-2 px-4 rounded-lg cursor-pointer hover:bg-[#f9f9f9] hover:text-[#FF6363] transition-all duration-200"
                >
                  Tài khoản
                </div>
                <div className="border-t-[1px] border-[#FBDCB0] my-2"></div>
                <p
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setIsDropdownOpen(false);
                  }}
                  className="block text-[#FF6363] font-medium text-[16px] py-2 px-4 rounded-lg cursor-pointer hover:bg-[#fcecec] hover:text-red-600 transition-all duration-200"
                >
                  Đăng xuất
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
