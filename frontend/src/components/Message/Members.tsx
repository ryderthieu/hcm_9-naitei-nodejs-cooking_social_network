import React, { useState, useEffect } from "react";
import type { Member } from "../../types/conversation.type";
import { MdOutlineNavigateBefore, MdOutlinePersonAdd } from "react-icons/md";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import { useAuth } from "../../contexts/AuthContext";
import { Trash2, Search, X, UserPlus } from "lucide-react";
import { getFollowings, searchUsers } from "../../services/user.service";

interface MembersProps {
  members: Member[];
  onRemoveMember: (member: Member) => void;
  onAddMember: (member: Member) => void;
  onBack: () => void;
}

export const Members: React.FC<MembersProps> = ({
  members,
  onRemoveMember,
  onAddMember,
  onBack,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<Member[]>([]);
  const [searchResults, setSearchResults] = useState<Member[]>([]);

  useEffect(() => {
    if (isAddingMember && user?.username) {
      setLoading(true);
      getFollowings(user.username)
        .then((users) => setSuggestedUsers(users))
        .finally(() => setLoading(false));
    }
  }, [isAddingMember, user?.username]);

  useEffect(() => {
    if (!isAddingMember) return;

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(() => {
      setLoading(true);
      searchUsers(searchQuery)
        .then((users) => setSearchResults(users))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery, isAddingMember]);

  return (
    <div className="pt-4 flex flex-1 flex-col gap-4">
      <div className="flex items-center flex-1 mx-4">
        <MdOutlineNavigateBefore
          size={24}
          className="cursor-pointer"
          onClick={() => {
            if (isAddingMember) {
              setIsAddingMember(false);
              setSearchQuery("");
              setSearchResults([]);
            } else {
              onBack();
            }
          }}
        />
        <h2 className="text-lg font-semibold text-center flex-1">
          {isAddingMember
            ? "Thêm thành viên"
            : `Thành viên (${members.length})`}
        </h2>
        {!isAddingMember && (
          <MdOutlinePersonAdd
            size={24}
            className="cursor-pointer"
            onClick={() => setIsAddingMember(true)}
          />
        )}
      </div>

      <hr className="text-gray-200" />

      {isAddingMember && (
        <div className="mx-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm người để thêm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X size={18} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!isAddingMember ? (
          <div className="space-y-1">
            {members.map((member) => (
              <a
                href={`/profile/${member.username}`}
                key={member.id}
                className="flex items-center gap-4 px-3 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm group"
              >
                <img
                  src={member.avatar || DEFAULT_AVATAR_URL}
                  alt={member.firstName + " " + member.lastName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-base font-semibold text-gray-900 truncate">
                    {member.id === user?.id
                      ? "Bạn"
                      : `${member.firstName} ${member.lastName}`}
                  </span>
                  <p className="text-sm text-gray-500 truncate">
                    {member.username}
                  </p>
                </div>
                {member.id !== user?.id && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveMember(member);
                      }}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200 group/btn"
                    >
                      <Trash2
                        size={18}
                        className="text-gray-400 group-hover/btn:text-red-500 transition-colors duration-200 hover:cursor-pointer"
                      />
                    </button>
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {loading && (
              <p className="text-center text-gray-500 py-4">Đang tải...</p>
            )}

            {!loading &&
              searchQuery.trim() === "" &&
              suggestedUsers.length > 0 && (
                <h3 className="px-3 py-2 text-sm font-medium text-gray-500 uppercase">
                  Người bạn đang theo dõi
                </h3>
              )}

            {!loading &&
              (searchQuery ? searchResults : suggestedUsers).map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-4 px-3 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                >
                  <img
                    src={person.avatar || DEFAULT_AVATAR_URL}
                    alt={person.firstName + " " + person.lastName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {`${person.firstName} ${person.lastName}`}
                    </span>
                    <p className="text-sm text-gray-500 truncate">
                      {person.username}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onAddMember(person);
                      setIsAddingMember(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="p-2 hover:bg-green-50 rounded-full transition-colors duration-200 hover:cursor-pointer"
                  >
                    <UserPlus size={18} className="text-green-600" />
                  </button>
                </div>
              ))}

            {!loading &&
              (searchQuery ? searchResults : suggestedUsers).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Search size={48} className="mb-4 opacity-50" />
                  <p className="text-base font-medium mb-2">
                    Không tìm thấy kết quả
                  </p>
                  <p className="text-sm text-center">
                    {searchQuery
                      ? `Không có người nào phù hợp với "${searchQuery}"`
                      : "Không có người nào để gợi ý"}
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
