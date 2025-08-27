import { timeAgoVi, showErrorAlert } from "../../../utils/utils";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { followUser, unfollowUser } from "../../../services/user.service";

interface UserHeaderProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    username?: string;
  };
  timestamp?: string | Date;
  size?: "sm" | "md" | "lg";
  showTimestamp?: boolean;
  showName?: boolean;
  showUsername?: boolean;
  className?: string;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  currentUserId?: number;
  onFollowChange?: (isFollowing: boolean) => void;
  hideAvatar?: boolean;
  onNameClick?: () => void;
}

export default function UserHeader({
  user,
  timestamp,
  size = "md",
  showTimestamp = true,
  showName = true,
  showUsername = false,
  className = "",
  showFollowButton = false,
  isFollowing = false,
  currentUserId,
  onFollowChange,
  hideAvatar = false
}: UserHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const sizeClasses = {
    sm: {
      avatar: "w-8 h-8",
      name: "text-sm",
      timestamp: "text-xs"
    },
    md: {
      avatar: "w-10 h-10",
      name: "text-sm",
      timestamp: "text-xs"
    },
    lg: {
      avatar: "w-12 h-12",
      name: "font-semibold text-gray-900",
      timestamp: "text-sm text-gray-500"
    }
  };

  const classes = sizeClasses[size];

  const handleFollowClick = async () => {
    if (loading || !user.username) return;
    
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(user.username);
        setFollowing(false);
        onFollowChange?.(false);
      } else {
        await followUser(user.username);
        setFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      showErrorAlert(error, "Không thể thực hiện thao tác. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const shouldShowFollowButton = showFollowButton && currentUserId && currentUserId !== user.id;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!hideAvatar && (
        <img
          src={user.avatar || DEFAULT_AVATAR_URL}
          alt="avatar"
          className={`${classes.avatar} rounded-full object-cover border border-gray-200`}
        />
      )}
      {showName && (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div 
              className={`${classes.name} font-bold text-gray-900 hover:text-gray-700 cursor-pointer transition-colors`}
              onClick={() => {
                const target = `/profile/${user.username}`;
                if (location.pathname === target) {
                  window.location.assign(target);
                } else {
                  navigate(target);
                }
              }}
            >
              {user.firstName} {user.lastName}
            </div>
            {shouldShowFollowButton && (
              <button
                onClick={handleFollowClick}
                disabled={loading}
                className={`font-medium text-sm transition-colors disabled:opacity-50 ${
                  following 
                    ? "text-gray-500 hover:text-gray-600" 
                    : "text-yellow-600 hover:text-yellow-700"
                }`}
              >
                {loading ? "..." : following ? "✓ Đang theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>
          {showUsername && user.username && (
            <div className="text-sm text-gray-500">@{user.username}</div>
          )}
          {showTimestamp && timestamp && (
            <div className={classes.timestamp}>
              {timeAgoVi(timestamp.toString())}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
