import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
} from "@heroicons/react/24/solid";
import { FaShare } from "react-icons/fa";
import { useDropdown } from "../../hooks";
import { ThreeDotsMenu } from "../common";
import type { PostEntity } from "../../types/post.type";
import {
  deletePost,
  likePost,
  unlikePost,
  updatePost,
  sharePost,
  savePost,
  unsavePost,
} from "../../services/post.service";
import Comments from "./Comments";
import { useAuth } from "../../contexts/AuthContext";
import UserHeader from "../common/user/UserHeader";
import MediaCarousel from "../common/media/MediaCarousel";
import { showErrorAlert } from "../../utils/utils";

interface PostProps {
  post: PostEntity;
  showActions?: boolean;
  className?: string;
}

export default function Post({ post, showActions = true, className = "" }: PostProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!post || !post.id || !post.author) {
    return (
      <article className={`relative w-full bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 overflow-hidden ${className}`}>
        <div className="px-4 py-6 text-center text-gray-500 bg-gray-50">
          <p className="text-sm">Dữ liệu bài viết không hợp lệ</p>
        </div>
      </article>
    );
  }

  const [data, setData] = useState(post);
  const [deleted, setDeleted] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState<boolean>(Boolean(post.liked_by_me));
  const [sharing, setSharing] = useState(false);
  const [shareActiveTab, setShareActiveTab] = useState<'social' | 'messages'>('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<boolean>(Boolean(post.saved_by_me));
  const [editing, setEditing] = useState(false);
  const [captionDraft, setCaptionDraft] = useState<string>(post.caption || "");
  const [showComments, setShowComments] = useState(false);
  const feedDropdown = useDropdown();
  const sharePopup = useDropdown();
  const [followingAuthor, setFollowingAuthor] = useState<boolean>(Boolean(post.following_author));

  useEffect(() => {
    setFollowingAuthor(Boolean(post.following_author));
  }, [post.following_author]);

  const handleDelete = async () => {
    if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        await deletePost(data.id);
        setShowDeleteMessage(true);
        setTimeout(() => {
          setShowDeleteMessage(false);
          setDeleted(true);
        }, 2000);
      } catch (error) {
        showErrorAlert(error, "Không thể xóa bài viết. Vui lòng thử lại!");
      }
    }
  };

  const handleToggleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      if (liked) {
        await unlikePost(data.id);
        setData({ ...data, likes_count: Math.max(0, data.likes_count - 1) });
        setLiked(false);
      } else {
        await likePost(data.id);
        setData({ ...data, likes_count: data.likes_count + 1 });
        setLiked(true);
      }
    } catch (e) {
      showErrorAlert(e, "Thao tác đã thất bại. Vui lòng thử lại!");
    } finally {
      setLiking(false);
    }
  };

  const handleShareClick = () => {
    sharePopup.toggle();
    setShareActiveTab('social');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleShareToUser = async (_userId: number) => {
    if (sharing) return;
    setSharing(true);
    try {
      await sharePost(data.id);
      setData({ ...data, shares_count: data.shares_count + 1 });
      sharePopup.close();

      alert("Chức năng gửi tin nhắn sẽ được triển khai sau!");
    } catch (e) {
      showErrorAlert(e, "Không thể chia sẻ bài viết. Vui lòng thử lại!");
    } finally {
      setSharing(false);
    }
  };

  const handleShareToSocial = async (platform: string) => {
    if (sharing) return;
    setSharing(true);
    try {
      await sharePost(data.id);
      setData({ ...data, shares_count: data.shares_count + 1 });
      sharePopup.close();

      const shareUrl = `${window.location.origin}/posts/${data.id}`;
      const shareText = `Xem bài viết này: ${data.caption.substring(0, 100)}...`;

      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'copy':
          navigator.clipboard.writeText(shareUrl);
          alert("Đã sao chép link bài viết!");
          break;
      }
    } catch (e) {
      showErrorAlert(e, "Không thể chia sẻ bài viết. Vui lòng thử lại!");
    } finally {
      setSharing(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }


    const mockUsers = [
      { id: 1, firstName: 'Nguyễn', lastName: 'Anh Quốc', avatar: null, status: 'Vừa xong' },
      { id: 2, firstName: 'Trần', lastName: 'Văn Nam', avatar: null, status: 'Online' },
      { id: 3, firstName: 'Lê', lastName: 'Thị Hoa', avatar: null, status: '2 phút trước' },
    ];

    const filtered = mockUsers.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
  };

  const handleToggleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsavePost(data.id);
        setData({ ...data, saves_count: Math.max(0, (data.saves_count || 0) - 1) });
        setSaved(false);
      } else {
        await savePost(data.id);
        setData({ ...data, saves_count: (data.saves_count || 0) + 1 });
        setSaved(true);
      }
    } catch (e) {
      showErrorAlert(e, "Không thể lưu bài viết. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };



  if (showDeleteMessage) {
    return (
      <article className={`relative w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        <div className="px-4 py-6 text-center text-green-600 bg-green-50">
          <TrashIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm font-medium">Bài viết đã được xóa thành công</p>
        </div>
      </article>
    );
  }

  if (deleted) {
    return null;
  }

  return (
    <>
      <article className={`relative w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        <div className="flex items-center justify-between p-4">
          <UserHeader
            user={data.author}
            timestamp={data.created_at}
            size="md"
            showFollowButton={true}
            isFollowing={followingAuthor}
            currentUserId={user?.id}
            onFollowChange={(isFollowing) => setFollowingAuthor(isFollowing)}
          />

          {user && user.id === data.author.id && (
            <ThreeDotsMenu
              items={[
                {
                  id: 'edit',
                  label: 'Chỉnh sửa',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ),
                  onClick: () => {
                    setEditing(true);
                    feedDropdown.close();
                  }
                },
                {
                  id: 'delete',
                  label: 'Xóa bài',
                  variant: 'danger',
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ),
                  onClick: () => {
                    handleDelete();
                    feedDropdown.close();
                  }
                }
              ]}
            />
          )}
        </div>

        {data.caption && (
          <div className="px-4 pb-3">
            {data.recipe && (
              <p className="text-gray-900 mb-2">
                <span
                  className="text-yellow-500 font-medium hover:underline cursor-pointer"
                  onClick={() => navigate(`/recipe/${data.recipe.slug || data.recipe.id}`)}
                >
                  @{data.recipe.title}
                </span>
              </p>
            )}
            <p className="text-gray-900">{data.caption}</p>
          </div>
        )}

        {data.media && data.media.length > 0 && (
          <div className="w-full">
            <MediaCarousel items={data.media} />
          </div>
        )}

        {showActions && (
          <div className="px-4 py-3">
            <PostActionBarComponent
              variant="feed"
              likesCount={data.likes_count}
              commentsCount={data.comments_count}
              sharesCount={data.shares_count || 0}
              savesCount={data.saves_count || 0}
              isLiked={liked}
              isSaved={saved}
              onLikeToggle={handleToggleLike}
              onCommentClick={() => setShowComments(true)}
              onShareClick={handleShareClick}
              onSaveClick={handleToggleSave}
              showSharePopup={sharePopup.isOpen}
              sharePopupRef={sharePopup.dropdownRef}
              shareActiveTab={shareActiveTab}
              setShareActiveTab={setShareActiveTab}
              searchQuery={searchQuery}
              searchResults={searchResults}
              onSearchUsers={handleSearchUsers}
              onShareToUser={handleShareToUser}
              onShareToSocial={handleShareToSocial}
            />
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 bg-yellow-50 bg-opacity-95 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Chỉnh sửa bài viết</h3>
              <textarea
                value={captionDraft}
                onChange={(e) => setCaptionDraft(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
                placeholder="Nhập nội dung bài viết..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    try {
                      await updatePost(data.id, { caption: captionDraft });
                      setData({ ...data, caption: captionDraft });
                      setEditing(false);
                    } catch (e) {
                      alert("Không thể cập nhật bài viết. Vui lòng thử lại!");
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {showComments && (
        <div className="fixed inset-0 bg-yellow-50 bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
            <div className="flex-1 bg-black overflow-hidden relative flex items-center justify-center">
              {data.media && data.media.length > 0 && (
                <div className="w-full h-full flex items-center justify-center">
                  <MediaCarousel items={data.media} />
                </div>
              )}

              <button
                onClick={() => setShowComments(false)}
                className="absolute top-4 left-4 bg-black bg-opacity-50 text-white hover:text-gray-300 transition-colors z-10 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="w-96 bg-white flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <UserHeader
                  user={data.author}
                  timestamp={data.created_at}
                  size="md"
                  showFollowButton={true}
                  isFollowing={followingAuthor}
                  currentUserId={user?.id}
                  onFollowChange={(isFollowing) => setFollowingAuthor(isFollowing)}
                />

                {user && user.id === data.author.id && (
                  <ThreeDotsMenu
                    items={[
                      {
                        id: 'edit',
                        label: 'Chỉnh sửa',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ),
                        onClick: () => {
                          setEditing(true);
                        }
                      },
                      {
                        id: 'delete',
                        label: 'Xóa bài',
                        variant: 'danger',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        ),
                        onClick: () => {
                          handleDelete();
                        }
                      }
                    ]}
                  />
                )}
              </div>

              {(data.recipe || data.caption) && (
                <div className="p-4 border-b border-gray-200">
                  {data.recipe && (
                    <p className="text-gray-900 mb-2">
                      <span
                        className="text-yellow-500 font-medium hover:underline cursor-pointer"
                        onClick={() => navigate(`/recipe/${data.recipe.slug || data.recipe.id}`)}
                      >
                        @{data.recipe.title}
                      </span>
                    </p>
                  )}
                  {data.caption && (
                    <p className="text-gray-900">{data.caption}</p>
                  )}
                </div>
              )}

              <div className="p-4 border-b border-gray-200">
                <PostActionBarComponent
                  variant="detail"
                  likesCount={data.likes_count}
                  commentsCount={data.comments_count}
                  sharesCount={data.shares_count || 0}
                  savesCount={data.saves_count || 0}
                  isLiked={liked}
                  isSaved={saved}
                  onLikeToggle={handleToggleLike}
                  onCommentClick={() => { }}
                  onShareClick={handleShareClick}
                  onSaveClick={handleToggleSave}
                  showSharePopup={sharePopup.isOpen}
                  sharePopupRef={sharePopup.dropdownRef}
                  shareActiveTab={shareActiveTab}
                  setShareActiveTab={setShareActiveTab}
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  onSearchUsers={handleSearchUsers}
                  onShareToUser={handleShareToUser}
                  onShareToSocial={handleShareToSocial}
                />
              </div>


              <div className="flex-1 min-h-0 overflow-y-auto">
                <Comments postId={data.id} />
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
}


function PostActionBarComponent({
  likesCount,
  commentsCount,
  sharesCount,
  savesCount = 0,
  isLiked,
  isSaved,
  onLikeToggle,
  onCommentClick,
  onShareClick,
  onSaveClick,
  showSharePopup,
  sharePopupRef,
  shareActiveTab,
  setShareActiveTab,
  searchQuery,
  searchResults,
  onSearchUsers,
  onShareToUser,
  onShareToSocial,
  variant = "feed",
  className = "",
}: {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount?: number;
  isLiked: boolean;
  isSaved?: boolean;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  onShareClick?: () => void;
  onSaveClick?: () => void;
  showSharePopup?: boolean;
  sharePopupRef?: React.RefObject<HTMLDivElement | null>;
  shareActiveTab?: 'social' | 'messages';
  setShareActiveTab?: (tab: 'social' | 'messages') => void;
  searchQuery?: string;
  searchResults?: any[];
  onSearchUsers?: (query: string) => void;
  onShareToUser?: (userId: number) => void;
  onShareToSocial?: (platform: string) => void;
  variant?: "feed" | "detail";
  className?: string;
}) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const getActionStyles = (action: string) => {
    const isHovered = hoveredAction === action;
    const isActive = (action === "like" && isLiked) ||
      (action === "save" && isSaved);

    if (isActive || isHovered) {
      return {
        container: "bg-yellow-100 rounded-full px-4 py-2",
        icon: "text-yellow-600",
        text: "text-yellow-700",
      };
    }

    return {
      container: "rounded-full px-4 py-2",
      icon: "text-gray-600",
      text: "text-gray-600",
    };
  };

  const likeStyles = getActionStyles("like");
  const commentStyles = getActionStyles("comment");
  const shareStyles = getActionStyles("share");
  const saveStyles = getActionStyles("save");

  const gap = variant === "feed" ? "gap-22" : "gap-4";
  const padding = variant === "feed" ? "py-3" : "py-5";

  return (
    <div
      className={`bg-yellow-25 border border-yellow-100 rounded-lg px-6 ${padding} ${className}`}
    >
      <div className="flex items-center justify-center">
        <div className={`flex items-center ${gap}`}>
          <button
            onClick={onLikeToggle}
            onMouseEnter={() => setHoveredAction("like")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${likeStyles.container}`}
          >
            {isLiked ? (
              <HeartIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} text-yellow-600`} />
            ) : (
              <HeartIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${likeStyles.icon}`} />
            )}
            <span className={`text-sm font-medium ${likeStyles.text}`}>
              {likesCount}
            </span>
          </button>

          <button
            onClick={onCommentClick}
            onMouseEnter={() => setHoveredAction("comment")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${commentStyles.container}`}
          >
            <ChatBubbleOvalLeftIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${commentStyles.icon}`} />
            <span className={`text-sm font-medium ${commentStyles.text}`}>
              {commentsCount}
            </span>
          </button>

          <button
            onClick={onShareClick}
            onMouseEnter={() => setHoveredAction("share")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${shareStyles.container}`}
          >
            <FaShare className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${shareStyles.icon}`} />
            <span className={`text-sm font-medium ${shareStyles.text}`}>
              {sharesCount}
            </span>
          </button>

          {showSharePopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="fixed inset-0"
                onClick={onShareClick}
              ></div>
              <div
                ref={sharePopupRef}
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border border-yellow-600/10"
                style={{
                  animation: 'popup 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <button
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-yellow-600 hover:scale-110 transition-all duration-300"
                  onClick={onShareClick}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  Chia sẻ bài viết
                </h3>

                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setShareActiveTab?.('social')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${shareActiveTab === 'social'
                        ? 'bg-white text-yellow-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    Mạng xã hội
                  </button>
                  <button
                    onClick={() => setShareActiveTab?.('messages')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${shareActiveTab === 'messages'
                        ? 'bg-white text-yellow-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    Tin nhắn
                  </button>
                </div>

                {shareActiveTab === 'social' ? (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => onShareToSocial?.('copy')}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
                    >
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span>Copy link</span>
                    </button>

                    <button
                      onClick={() => onShareToSocial?.('facebook')}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
                    >
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <span>Chia sẻ Facebook</span>
                    </button>

                    <button
                      onClick={() => onShareToSocial?.('twitter')}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-all duration-300 group"
                    >
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                        <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </div>
                      <span>Chia sẻ Twitter</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-4">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchQuery || ''}
                        onChange={(e) => onSearchUsers?.(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {(searchResults && searchResults.length > 0) ? (
                        searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => onShareToUser?.(user.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-all duration-300 group"
                          >
                            <img
                              src={user.avatar || "https://via.placeholder.com/150"}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-yellow-600 transition-all"
                            />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.status}</div>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ))
                      ) : (searchQuery && searchQuery.length >= 2) ? (
                        <div className="text-center py-8 text-gray-500">
                          Không tìm thấy cuộc trò chuyện
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Chưa có cuộc trò chuyện nào
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <style>{`
              @keyframes popup {
                from {
                  opacity: 0;
                  transform: scale(0.95) translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
            `}</style>
            </div>
          )}

          <button
            onClick={onSaveClick}
            onMouseEnter={() => setHoveredAction("save")}
            onMouseLeave={() => setHoveredAction(null)}
            className={`flex items-center ${variant === "detail" ? "justify-center" : ""} gap-2 px-4 py-2 rounded-full transition-all duration-200 ${saveStyles.container}`}
          >
            <BookmarkIcon className={`w-5 h-5 ${variant === "detail" ? "shrink-0 block" : ""} ${isSaved ? "text-yellow-600" : saveStyles.icon}`} />
            <span className={`text-sm font-medium ${saveStyles.text}`}>{savesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
