import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDropdown } from "../../hooks";
import { ThreeDotsMenu } from "../common";
import { SharePopup, EditPostPopup, DeleteConfirm } from "../popup";
import PostActionBar from "../common/ui/PostActionBar";
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
import {
  getConversations,
  createConversation,
} from "../../services/conversation.service";
import Comments from "./Comments";
import { useAuth } from "../../contexts/AuthContext";
import UserHeader from "../common/user/UserHeader";
import MediaCarousel from "../common/media/MediaCarousel";
import { showErrorAlert, showSuccessAlert } from "../../utils/utils";
import EmojiPicker from "emoji-picker-react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../../services/api.service";

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
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<boolean>(Boolean(post.saved_by_me));
  const [editingInModal, setEditingInModal] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [captionDraft, setCaptionDraft] = useState<string>(post.caption || "");
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
      showErrorAlert(error, "Không thể xóa bài viết. Vui lòng thử lại!");
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
      showErrorAlert(e, "Thao tác đã thất bại. Vui lòng thử lại!");
    } finally {
      setLiking(false);
    }
  };

  const handleShareClick = () => {
    sharePopup.toggle();
  };

  const handleShareToUser = async (userId: number) => {
    if (sharing) return;
    setSharing(true);
    try {
      const response = await sharePost(data.id);
      if (response.sharesCount !== undefined) {
        setData({ ...data, shares_count: response.sharesCount });
      }

      let conversationId: number;
      try {
        const conversation = await createConversation({ members: [userId] });
        conversationId = conversation.conversation.id;
      } catch (error: any) {
        if (error.message?.includes("already exists")) {
          const conversationsResponse = await getConversations();
          const conversations = Array.isArray(conversationsResponse)
            ? conversationsResponse
            : conversationsResponse.conversations || [];

          const existingConversation = conversations.find(
            (conv: any) =>
              conv.members?.length === 2 &&
              conv.members?.some((member: any) => member.id === userId)
          );
          if (!existingConversation) {
            throw new Error("Không thể tìm conversation hiện có");
          }
          conversationId = existingConversation.id;
        } else {
          throw error;
        }
      }

      const messageContent = JSON.stringify({
        id: data.id,
        caption: data.caption,
        slug: data.slug || null,
      });

      const token = getAccessToken();
      if (!token) {
        throw new Error("Không có token xác thực");
      }

      const socket = io("http://localhost:3000/messages", {
        auth: { token },
      });

      await new Promise((resolve, reject) => {
        socket.on("connect", () => {
          const payload = {
            conversationId,
            content: messageContent,
            type: "POST" as const,
            replyOf: null as number | null,
          };

          socket.emit("send_message", payload, (response: any) => {
            if (response && response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });
      });

      socket.disconnect();
      sharePopup.close();
      showSuccessAlert("Đã chia sẻ bài viết qua tin nhắn!");
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
      const response = await sharePost(data.id);
      if (response.sharesCount !== undefined) {
        setData({ ...data, shares_count: response.sharesCount });
      }
      sharePopup.close();

      const shareUrl = `${window.location.origin}/posts/${data.id}`;
      const shareText = `Xem bài viết này: ${data.caption.substring(
        0,
        100
      )}...`;

      switch (platform) {
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(shareText)}`,
            "_blank"
          );
          break;
        case "copy":
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
      showErrorAlert(e, "Không thể lưu bài viết. Vui lòng thử lại!");
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
                    navigate(`/recipe/${data.recipe.slug || data.recipe.id}`)
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
            <MediaCarousel items={data.media} />
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
              onCommentClick={() => setShowComments(true)}
              onShareClick={handleShareClick}
              onSaveClick={handleToggleSave}
            />
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
                  user={data.author}
                  timestamp={data.created_at}
                  size="md"
                  showFollowButton={true}
                  isFollowing={followingAuthor}
                  currentUserId={user?.id}
                  onFollowChange={(isFollowing) =>
                    setFollowingAuthor(isFollowing)
                  }
                />

                {user && user.id === data.author.id && (
                  <ThreeDotsMenu
                    items={[
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
                          setEditingInModal(true);
                          setCaptionDraft(data.caption || "");
                        },
                      },
                      {
                        id: "delete",
                        label: "Xóa bài",
                        variant: "danger",
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
                        },
                      },
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
                        onClick={() =>
                          navigate(
                            `/recipe/${data.recipe.slug || data.recipe.id}`
                          )
                        }
                      >
                        @{data.recipe.title}
                      </span>
                    </p>
                  )}
                  {editingInModal ? (
                    <div className="relative">
                      <textarea
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
                        rows={3}
                        placeholder="Nhập nội dung bài viết..."
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          😊
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingInModal(false);
                              setCaptionDraft(data.caption || "");
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await updatePost(data.id, {
                                  caption: captionDraft,
                                });
                                setData({ ...data, caption: captionDraft });
                                setEditingInModal(false);
                              } catch (e) {
                                showErrorAlert(
                                  e,
                                  "Không thể cập nhật bài viết. Vui lòng thử lại!"
                                );
                              }
                            }}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                      {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 z-10">
                          <EmojiPicker
                            onEmojiClick={(emojiObject) => {
                              setCaptionDraft(
                                (prev) => prev + emojiObject.emoji
                              );
                              setShowEmojiPicker(false);
                            }}
                            width={300}
                            height={400}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">{data.caption}</p>
                  )}
                </div>
              )}

              <div className="p-4 border-b border-gray-200">
                <PostActionBar
                  variant="detail"
                  likesCount={data.likes_count}
                  commentsCount={data.comments_count}
                  sharesCount={data.shares_count || 0}
                  savesCount={data.saves_count || 0}
                  isLiked={liked}
                  isSaved={saved}
                  onLikeToggle={handleToggleLike}
                  onCommentClick={() => {}}
                  onShareClick={handleShareClick}
                  onSaveClick={handleToggleSave}
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <Comments postId={data.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      <SharePopup
        isOpen={sharePopup.isOpen}
        onClose={sharePopup.close}
        onShareToUser={handleShareToUser}
        onShareToSocial={handleShareToSocial}
        postCaption={data.caption}
        postId={data.id}
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
    </>
  );
}
