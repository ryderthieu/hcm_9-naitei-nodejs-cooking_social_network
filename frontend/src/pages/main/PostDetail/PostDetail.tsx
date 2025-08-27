import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "../../../services/post.service";
import {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
} from "../../../services/post.service";
import { AlertPopup } from "../../../components/popup";
import { useAlertPopup } from "../../../hooks/useAlertPopup";
import { getPreviewImage } from "../../../utils/utils";
import { useAuth } from "../../../contexts/AuthContext";
import UserHeader from "../../../components/common/user/UserHeader";
import MediaCarousel from "../../../components/common/media/MediaCarousel";
import Comments from "../../../components/Post/Comments";
import PostActionBar from "../../../components/common/ui/PostActionBar";
import { SharePopup } from "../../../components/popup";
import type { PostEntity } from "../../../types/post.type";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { alert, showError, showInfo, closeAlert } = useAlertPopup();

  const [post, setPost] = useState<PostEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await getPostById(parseInt(id));
        setPost(response.post);
      } catch (err) {
        setError("Không thể tải bài viết");
        showError("Lỗi khi tải bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    if (!user) {
      showInfo("Vui lòng đăng nhập để thực hiện thao tác này", {
        onConfirm: () => navigate("/auth/login"),
      });
      return;
    }

    try {
      setLiking(true);
      if (post.liked_by_me) {
        await unlikePost(post.id);
        setPost((prev) =>
          prev
            ? { ...prev, liked_by_me: false, likes_count: prev.likes_count - 1 }
            : null
        );
      } else {
        await likePost(post.id);
        setPost((prev) =>
          prev
            ? { ...prev, liked_by_me: true, likes_count: prev.likes_count + 1 }
            : null
        );
      }
    } catch (err) {
      showError("Không thể thực hiện thao tác");
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async () => {
    if (!post) return;
    if (!user) {
      showInfo("Vui lòng đăng nhập để thực hiện thao tác này", {
        onConfirm: () => navigate("/auth/login"),
      });
      return;
    }

    try {
      setSaving(true);
      if (post.saved_by_me) {
        await unsavePost(post.id);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                saved_by_me: false,
                saves_count: (prev.saves_count || 0) - 1,
              }
            : null
        );
      } else {
        await savePost(post.id);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                saved_by_me: true,
                saves_count: (prev.saves_count || 0) + 1,
              }
            : null
        );
      }
    } catch (err) {
      showError("Không thể thực hiện thao tác");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Bài viết không tồn tại"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-yellow-50 bg-opacity-95 backdrop-blur-sm py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
            <div className="flex-1 bg-black overflow-hidden relative flex items-center justify-center">
              {post.media && post.media.length > 0 && (
                <div className="w-full h-full flex items-center justify-center">
                  <MediaCarousel items={post.media} />
                </div>
              )}

              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 bg-black bg-opacity-50 text-white hover:text-gray-300 transition-colors z-10 rounded-full p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="w-96 bg-white flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <UserHeader
                  user={post.author}
                  timestamp={post.created_at}
                  size="md"
                  showFollowButton={true}
                  isFollowing={post.following_author}
                  currentUserId={user?.id}
                />
              </div>

              {(post.recipe || post.caption) && (
                <div className="p-4 border-b border-gray-200">
                  {post.recipe && (
                    <p className="text-gray-900 mb-2">
                      <span
                        className="text-yellow-500 font-medium hover:underline cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/recipe/${post.recipe.slug || post.recipe.id}`
                          )
                        }
                      >
                        @{post.recipe.title}
                      </span>
                    </p>
                  )}
                  <p className="text-gray-900">{post.caption}</p>
                </div>
              )}

              <div className="p-4 border-b border-gray-200">
                <PostActionBar
                  variant="detail"
                  likesCount={post.likes_count}
                  commentsCount={post.comments_count}
                  sharesCount={post.shares_count || 0}
                  savesCount={post.saves_count || 0}
                  isLiked={Boolean(post.liked_by_me)}
                  isSaved={Boolean(post.saved_by_me)}
                  onLikeToggle={handleLike}
                  onCommentClick={() => {}}
                  onShareClick={() => setShowSharePopup(true)}
                  onSaveClick={handleSave}
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <Comments postId={post.id} />
              </div>
            </div>
          </div>
        </div>

        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          postCaption={post.caption}
          postId={post.id}
          image={getPreviewImage(post)}
          onShareSuccess={(sharesCount) => {
            setPost((prev) =>
              prev ? { ...prev, shares_count: sharesCount } : prev
            );
          }}
        />
      </div>
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
