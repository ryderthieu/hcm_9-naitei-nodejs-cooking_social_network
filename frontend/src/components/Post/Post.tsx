import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDropdown } from "../../hooks";
import { ThreeDotsMenu } from "../common";
import { SharePopup, EditPostPopup, DeleteConfirm, AlertPopup } from "../popup";
import PostActionBar from "../common/ui/PostActionBar";
import type { PostEntity } from "../../types/post.type";
import {
  deletePost,
  likePost,
  unlikePost,
  updatePost,
  savePost,
  unsavePost,
} from "../../services/post.service";
import { useAuth } from "../../contexts/AuthContext";
import UserHeader from "../common/user/UserHeader";
import MediaGrid from "../common/media/MediaGrid";
import { useAlertPopup } from "../../hooks/useAlertPopup";

interface PostProps {
  post: PostEntity;
  showActions?: boolean;
  className?: string;
}

export default function Post({
  post,
  showActions = true,
  className = "",
}: PostProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alert, showError, showInfo, closeAlert } = useAlertPopup();

  if (!post || !post.id || !post.author) {
    return (
      <article
        className={`relative w-full bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 overflow-hidden ${className}`}
      >
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<boolean>(Boolean(post.saved_by_me));
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const feedDropdown = useDropdown();
  const sharePopup = useDropdown();
  const [followingAuthor, setFollowingAuthor] = useState<boolean>(
    Boolean(post.following_author)
  );

  useEffect(() => {
    setFollowingAuthor(Boolean(post.following_author));
  }, [post.following_author]);

  const handleDelete = async () => {
    try {
      await deletePost(data.id);
      setShowDeleteMessage(true);
      setTimeout(() => {
        setShowDeleteMessage(false);
        setDeleted(true);
      }, 2000);
    } catch (error) {
      showError("Không thể xóa bài viết. Vui lòng thử lại!");
    }
  };

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
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
      showError("Thao tác đã thất bại. Vui lòng thử lại!");
    } finally {
      setLiking(false);
    }
  };

  const handleShareClick = () => {
    sharePopup.toggle();
  };

  const handleToggleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsavePost(data.id);
        setData({
          ...data,
          saves_count: Math.max(0, (data.saves_count || 0) - 1),
        });
        setSaved(false);
      } else {
        await savePost(data.id);
        setData({ ...data, saves_count: (data.saves_count || 0) + 1 });
        setSaved(true);
      }
    } catch (e) {
      showError("Không thể lưu bài viết. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  if (showDeleteMessage) {
    return (
      <article
        className={`relative w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      >
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

  const menuItems = [
    {
      id: "edit",
      label: "Chỉnh sửa",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      onClick: () => {
        setShowEditPopup(true);
        feedDropdown.close();
      },
    },
    {
      id: "delete",
      label: "Xóa bài",
      variant: "danger" as const,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      onClick: () => {
        openDeleteConfirm();
        feedDropdown.close();
      },
    },
  ];

  return (
    <>
      <article
        className={`relative w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      >
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
            <ThreeDotsMenu items={menuItems} />
          )}
        </div>

        {data.caption && (
          <div className="px-4 pb-3">
            {data.recipe && (
              <p className="text-gray-900 mb-2">
                <span
                  className="text-yellow-500 font-medium hover:underline cursor-pointer"
                  onClick={() =>
                    navigate(`/detail-recipe/${data.recipe.id}`)
                  }
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
            <MediaGrid items={data.media} postId={data.id} />
          </div>
        )}

        {showActions && (
          <div className="px-4 py-3">
            <PostActionBar
              variant="feed"
              likesCount={data.likes_count}
              commentsCount={data.comments_count}
              sharesCount={data.shares_count || 0}
              savesCount={data.saves_count || 0}
              isLiked={liked}
              isSaved={saved}
              onLikeToggle={handleToggleLike}
              onCommentClick={() => navigate(`/post/${data.id}`)}
              onShareClick={handleShareClick}
              onSaveClick={handleToggleSave}
            />
          </div>
        )}
      </article>

      <SharePopup
        isOpen={sharePopup.isOpen}
        onClose={sharePopup.close}
        postCaption={data.caption}
        postId={data.id}
        onShareSuccess={(sharesCount) => {
          setData((prev) =>
            prev ? { ...prev, shares_count: sharesCount } : prev
          );
        }}
      />

      <EditPostPopup
        post={data}
        isOpen={showEditPopup}
        onClose={() => setShowEditPopup(false)}
        onUpdate={(updatedPost) => {
          setData(updatedPost);
          setShowEditPopup(false);
        }}
      />

      <DeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        type="post"
      />

      <AlertPopup
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        showCancel={alert.showCancel}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onClose={closeAlert}
      />
    </>
  );
}
