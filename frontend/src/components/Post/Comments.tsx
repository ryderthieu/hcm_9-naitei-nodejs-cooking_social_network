import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchComments, fetchReplies, createComment, updateComment, deleteComment, likeComment, unlikeComment } from "../../services/comment.service";
import type { CommentEntity } from "../../types/comment.type";
import CommentInput from "../common/forms/CommentInput";
import ReplyItem from "./ReplyItem";
import { LoadingSpinner } from "../common";
import { showErrorAlert } from "../../utils/utils";
import { DeleteConfirm } from "../popup";

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    commentId: number | null;
    replyId: number | null;
    type: 'comment' | 'reply';
  }>({ isOpen: false, commentId: null, replyId: null, type: 'comment' });

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadRepliesRecursively = async (postId: number, commentId: number): Promise<CommentEntity[]> => {
    try {
      const repliesData = await fetchReplies(postId, commentId);
      const replies = repliesData.replies || [];

      const repliesWithNested = await Promise.all(
        replies.map(async (reply) => {
          try {
            const nestedReplies = await loadRepliesRecursively(postId, reply.id);
            return { ...reply, replies: nestedReplies };
      } catch (error) {
            return { ...reply, replies: [] };
          }
        })
      );

      return repliesWithNested;
    } catch (error) {
      return [];
    }
  };

  const loadComments = async () => {
    try {
    setLoading(true);
      const data = await fetchComments(postId);
      const commentsWithReplies = await Promise.all(
        (data.comments || []).map(async (comment) => {
          try {
            const replies = await loadRepliesRecursively(postId, comment.id);
            return {
              ...comment,
              replies: replies
            };
          } catch (error) {
            return {
              ...comment,
              replies: []
            };
          }
        })
      );
      setComments(commentsWithReplies);
      } catch (error) {
      showErrorAlert(error, "Không thể tải bình luận. Vui lòng thử lại!");
      } finally {
      setLoading(false);
    }
  };

  const getTotalCommentsCount = (comments: CommentEntity[]): number => {
    return comments.reduce((total, comment) => {
      let count = 1;
      if (comment.replies && comment.replies.length > 0) {
        count += getTotalCommentsCount(comment.replies); 
      }
      return total + count;
    }, 0);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const response = await createComment(postId, { comment: newComment.trim() });
      setComments(prev => [response.comment, ...prev]);
      setNewComment("");
    } catch (error) {
      showErrorAlert(error, "Không thể tạo bình luận. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number, newText: string) => {
    try {
      await updateComment(postId, commentId, { comment: newText });
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, comment: newText }
            : c
        )
      );
    } catch (error) {
      showErrorAlert(error, "Không thể cập nhật bình luận. Vui lòng thử lại!");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(postId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      showErrorAlert(error, "Không thể xóa bình luận. Vui lòng thử lại!");
    }
  };

  const openDeleteConfirm = async (commentId: number) => {
    setDeleteConfirm({ isOpen: true, commentId, replyId: null, type: 'comment' });
  };

  const openDeleteReplyConfirm = async (commentId: number, replyId: number) => {
    setDeleteConfirm({ isOpen: true, commentId, replyId, type: 'reply' });
  };

  const handleDeleteReply = async (commentId: number, replyId: number) => {
    try {
      await deleteComment(postId, replyId);
      await reloadRepliesForComment(commentId);
    } catch (error) {
      showErrorAlert(error, "Không thể xóa phản hồi. Vui lòng thử lại!");
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.liked_by_me) {
        await unlikeComment(postId, commentId);
        setComments(prev =>
          prev.map(c =>
            c.id === commentId
              ? { ...c, likes_count: Math.max(0, c.likes_count - 1), liked_by_me: false }
              : c
          )
        );
      } else {
        await likeComment(postId, commentId);
        setComments(prev =>
          prev.map(c =>
            c.id === commentId
              ? { ...c, likes_count: c.likes_count + 1, liked_by_me: true }
              : c
          )
        );
      }
    } catch (error) {
      showErrorAlert(error, "Không thể thích bình luận. Vui lòng thử lại!");
    }
  };

  const reloadRepliesForComment = async (commentId: number) => {
    try {
      const replies = await loadRepliesRecursively(postId, commentId);
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, replies: replies }
            : c
        )
      );
    } catch (error) {
      showErrorAlert(error, "Không thể tải phản hồi. Vui lòng thử lại!");
    }
  };

  const handleSubmitReply = async (commentId: number, replyText: string) => {
    if (!replyText.trim() || !user) return;

    try {
      setSubmitting(true);
      await createComment(postId, {
        comment: replyText.trim(),
        replyOf: commentId
      });
      await reloadRepliesForComment(commentId);
    } catch (error) {
      showErrorAlert(error, "Không thể tạo phản hồi. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyToReply = async (commentId: number, replyId: number, replyText: string) => {
    if (!replyText.trim() || !user) return;

    try {
      setSubmitting(true);
      await createComment(postId, {
        comment: replyText.trim(),
        replyOf: replyId
      });
      await reloadRepliesForComment(commentId);
    } catch (error) {
      showErrorAlert(error, "Không thể tạo phản hồi. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReply = async (commentId: number, replyId: number) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const reply = comment.replies?.find(r => r.id === replyId);
      if (!reply) return;

      if (reply.liked_by_me) {
        await unlikeComment(postId, replyId);
      } else {
        await likeComment(postId, replyId);
      }

      await reloadRepliesForComment(commentId);
    } catch (error) {
      showErrorAlert(error, "Không thể thích phản hồi. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-gray-600 mt-2">Đang tải bình luận...</p>
              </div>
    );
  }

  return (
    <>
    <div className="p-4 flex flex-col h-full">

      {comments.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{getTotalCommentsCount(comments)} bình luận</h3>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors">
            <span>Sắp xếp theo</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            </button>
          </div>
        )}

      <div className="space-y-4 flex-1 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Chưa có bình luận nào</p>
            <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
                      </div>
                    ) : (
          comments.map((comment) => (
            <ReplyItem
              key={comment.id}
              id={comment.id}
              user={comment.user}
              comment={comment.comment}
              created_at={comment.created_at}
              likes_count={comment.likes_count}
              liked_by_me={comment.liked_by_me ?? false}
              isOwner={user && Number(user.id) === Number(comment.user.id) ? true : false}
              isPostOwner={false}
              onLikeToggle={() => handleLikeComment(comment.id)}
              onEdit={(newText: string) => handleUpdateComment(comment.id, newText)}
              onDelete={() => openDeleteConfirm(comment.id)}
              onReply={(replyText: string) => handleSubmitReply(comment.id, replyText)}
              depth={0}
              replies={comment.replies || []}
              onLoadReplies={async () => {
                await reloadRepliesForComment(comment.id);
              }}
              onLoadRepliesForReply={async (replyId: number) => {
                return await loadRepliesRecursively(postId, replyId);
              }}
              onReplyToReply={(replyId: number, replyText: string) => handleReplyToReply(comment.id, replyId, replyText)}
              onLikeReply={(replyId: number) => handleLikeReply(comment.id, replyId)}
              onDeleteReply={(replyId: number) => openDeleteReplyConfirm(comment.id, replyId)}
              currentUser={user}
            />
          ))
        )}
      </div>

      {user && (
        <div className="pt-4 border-t border-gray-200">
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleSubmitComment}
            placeholder="Viết bình luận..."
            buttonText="Gửi"
            loading={submitting}
            avatarUrl={user.avatar}
            showEmoji
          />
        </div>
      )}
    </div>

    <DeleteConfirm
      isOpen={deleteConfirm.isOpen}
      onClose={() => setDeleteConfirm({ isOpen: false, commentId: null, replyId: null, type: 'comment' })}
      onConfirm={() => {
        if (deleteConfirm.type === 'comment' && deleteConfirm.commentId) {
          handleDeleteComment(deleteConfirm.commentId);
          setDeleteConfirm({ isOpen: false, commentId: null, replyId: null, type: 'comment' });
        } else if (deleteConfirm.type === 'reply' && deleteConfirm.commentId && deleteConfirm.replyId) {
          handleDeleteReply(deleteConfirm.commentId, deleteConfirm.replyId);
          setDeleteConfirm({ isOpen: false, commentId: null, replyId: null, type: 'comment' });
        }
      }}
      type="comment"
    />
  </>
  );
}


