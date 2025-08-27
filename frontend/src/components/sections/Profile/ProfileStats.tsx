import React, { useState } from "react";
import FollowersPopup from "../../popup/FollowersPopup";

interface ProfileStatsProps {
  stats: any;
  username?: string;
  onStatsChange?: (type: 'followers' | 'following', count: number) => void;
}

export default function ProfileStats({ stats, username, onStatsChange }: ProfileStatsProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  return (
    <>
      <div className="flex w-full justify-between gap-8 pt-4 border-t border-gray-100">
        <div className="flex-1 text-center cursor-default rounded-lg p-3">
          <div className="text-xl font-bold text-gray-900">{stats?.posts?.count || 0}</div>
          <div className="text-sm text-gray-500 whitespace-nowrap">Bài đăng</div>
        </div>
        <div className="flex-1 text-center cursor-default rounded-lg p-3">
          <div className="text-xl font-bold text-gray-900">{stats?.recipes?.count || 0}</div>
          <div className="text-sm text-gray-500 whitespace-nowrap">Công thức</div>
        </div>
        <button
          onClick={() => setShowFollowers(true)}
          className="flex-1 text-center hover:bg-gray-50 transition-all duration-200 ease-in-out rounded-lg p-3"
        >
          <div className="text-xl font-bold text-gray-900">{stats?.followers?.count || 0}</div>
          <div className="text-sm text-gray-500 whitespace-nowrap">Người theo dõi</div>
        </button>
        <button
          onClick={() => setShowFollowing(true)}
          className="flex-1 text-center hover:bg-gray-50 transition-all duration-200 ease-in-out rounded-lg p-3"
        >
          <div className="text-xl font-bold text-gray-900">{stats?.following?.count || 0}</div>
          <div className="text-sm text-gray-500 whitespace-nowrap">Đang theo dõi</div>
        </button>
      </div>

      {username && (
        <>
          <FollowersPopup
            isOpen={showFollowers}
            onClose={() => setShowFollowers(false)}
            username={username}
            type="followers"
            onStatsChange={onStatsChange}
          />
          <FollowersPopup
            isOpen={showFollowing}
            onClose={() => setShowFollowing(false)}
            username={username}
            type="following"
            onStatsChange={onStatsChange}
          />
        </>
      )}
    </>
  );
}
