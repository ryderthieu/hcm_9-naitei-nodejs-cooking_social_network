import { useState, useEffect } from "react";
import { getUserByUsername, toggleFollow } from "../../../services/user.service";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import type { UserData } from "../../../types/user.type";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";
import type { User } from "../../../types/auth.type";


interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { user: currentUser } = useAuth() as { user: UserData | null };
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [userInfo, setUserInfo] = useState<UserData>(user);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userData = await getUserByUsername(user.username);
        setUserInfo(userData);
        setIsFollowing(userData.isFollowing);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    getUserInfo();
  }, [isLoadingFollow, user.id]);

  const handleFollowToggle = async () => {
    if (!currentUser || currentUser.id === userInfo.id) return;
    setIsLoadingFollow(true);
    try {
      await toggleFollow(userInfo.username);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 transition-all hover:shadow-xl">
      <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
        <img
          src={userInfo.avatar || DEFAULT_AVATAR_URL}
          alt={`${userInfo.lastName || ""} ${userInfo.firstName || ""}`}
          className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB800] shadow-md"
        />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-800 hover:text-[#FFB800] transition-colors">
            <Link to={`/profile/${userInfo.username}`}>
              {userInfo.lastName} {userInfo.firstName}
            </Link>
          </h3>
          <p className="text-sm text-gray-500">
            @{userInfo.username}
          </p>

          <div className="mt-3 flex justify-center sm:justify-start space-x-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-700">
                {userInfo.followers}
              </span>{" "}
              Người theo dõi
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                {userInfo.followings}
              </span>{" "}
              Đang theo dõi
            </div>
          </div>
        </div>
        {currentUser && userInfo.id !== currentUser.id && (
          <button
            onClick={handleFollowToggle}
            disabled={isLoadingFollow}
            className={`mt-4 sm:mt-0 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out 
              ${
                isFollowing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-[#FFB800] text-white hover:bg-[#E6A600] shadow-sm"
              }
              ${isLoadingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoadingFollow
              ? "Đang xử lý..."
              : isFollowing
              ? "Đang theo dõi"
              : "Theo dõi"}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
