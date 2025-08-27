import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../common/user/UserHeader";
import CommentInput from "../common/forms/CommentInput";
import { timeAgoVi } from "../../utils/utils";
import { useAlertPopup } from "../../hooks/useAlertPopup";
import HeartIcon from "./icons/HeartIcon";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { FaReply } from "react-icons/fa";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";
import EmojiPicker from "emoji-picker-react";

interface ReplyUser {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  username?: string;
}

interface ReplyItemProps {
  id: number;
  user: ReplyUser;
  comment: string;
  created_at: string | Date;
  likes_count: number;
  liked_by_me?: boolean | null;
  isOwner?: boolean;
  isPostOwner?: boolean;
  onLikeToggle: () => void;
  onEdit: (newText: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onReply: (replyText: string) => Promise<void>;
  className?: string;
  depth?: number;
  replies?: any[];
  onLoadReplies?: () => Promise<void>;
  onLoadRepliesForReply?: (replyId: number) => Promise<any[]>;
  onReplyToReply?: (replyId: number, replyText: string) => Promise<void>;
  onLikeReply?: (replyId: number) => Promise<void>;
  onDeleteReply?: (replyId: number) => Promise<void>;
  currentUser?: any;
}

export default function ReplyItem({
  id: _id,
  user,
  comment,
  created_at,
  likes_count,
  liked_by_me,
  isOwner = false,
  isPostOwner = false,
  onLikeToggle,
  onEdit,
  onDelete,
  onReply,
  className = "",
  depth = 0,
  replies = [],
  onLoadReplies,
  onLoadRepliesForReply,
  onReplyToReply,
  onLikeReply,
  onDeleteReply,
  currentUser
}: ReplyItemProps) {
  const navigate = useNavigate();
  const { showError } = useAlertPopup();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);
  const [showNestedReplies, setShowNestedReplies] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const canModify = isOwner || isPostOwner;



  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = async () => {
    if (savingEdit) return;
    const val = editText.trim();
    if (!val || val === comment) {
      setIsEditing(false);
      setEditText(comment);
      return;
    }
    setSavingEdit(true);
    try {
      await onEdit(val);
      setIsEditing(false);
    } catch (error) {
      showError("Thao tác đã thất bại. Vui lòng thử lại!");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReply = async () => {
    const content = replyText.trim();
    if (!content || postingReply) return;

    setPostingReply(true);
    try {
      await onReply(content);
      setReplyText("");
      setShowReplyInput(false);
      if (onLoadReplies) {
        await onLoadReplies();
      }
    } catch (error) {
      showError("Thao tác đã thất bại. Vui lòng thử lại!");
    } finally {
      setPostingReply(false);
    }
  };

  const handleReplyClick = () => {
    setShowReplyInput(true);
    setReplyText(`@${user.firstName} ${user.lastName || ""} `);
  };

  const handleNestedReply = async (replyId: number, replyText: string) => {
    if (onReplyToReply) {
      try {
        await onReplyToReply(replyId, replyText);
        if (onLoadReplies) {
          await onLoadReplies();
        }
      } catch (error) {
        showError("Không thể gửi phản hồi. Vui lòng thử lại!");
      }
    }
  };

  const handleLikeNestedReply = async (replyId: number) => {
    if (onLikeReply) {
      try {
        await onLikeReply(replyId);
      } catch (error) {
        showError("Không thể thích phản hồi. Vui lòng thử lại!");
      }
    }
  };

  const handleDeleteNestedReply = async (replyId: number) => {
    if (onDeleteReply) {
      try {
        await onDeleteReply(replyId);
        if (onLoadReplies) {
          await onLoadReplies();
        }
      } catch (error) {
        showError("Không thể xóa phản hồi. Vui lòng thử lại!");
      }
    }
  };

  const indentClass = depth === 0 ? "" : `ml-${Math.min(depth * 8, 32)}`;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`flex items-start gap-3 ${indentClass}`}>
        <div className="flex-shrink-0 pt-1">
          <img
            src={user.avatar || DEFAULT_AVATAR_URL}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-lg p-3 text-sm relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1">
                  <UserHeader
                    user={{ id: user.id, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar, username: user.username }}
                    size="md"
                    showTimestamp={false}
                    showUsername={false}
                    showFollowButton={false}
                    hideAvatar={true}
                    onNameClick={() => navigate(`/profile/${user.username}`)}
                    className="!gap-0"
                  />
                </div>
                {isEditing ? (
                  <div className="mt-1">
                    <div className="relative">
                      <input
                        className="w-full border rounded px-3 py-1 text-sm pr-8"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        😊
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 z-10">
                          <EmojiPicker
                            onEmojiClick={(emojiObject) => {
                              setEditText(prev => prev + emojiObject.emoji);
                              setShowEmojiPicker(false);
                            }}
                            width={250}
                            height={300}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        className="px-3 py-1 text-sm rounded bg-yellow-500 text-white disabled:opacity-60"
                        disabled={savingEdit || editText.trim() === ""}
                        onClick={handleEdit}
                      >
                        Lưu
                      </button>
                      <button
                        className="px-3 py-1 text-sm rounded border"
                        onClick={() => {
                          setIsEditing(false);
                          setEditText(comment);
                          setShowEmojiPicker(false);
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{comment}</p>
                )}
              </div>
              {canModify && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 min-w-[140px] z-10">
                      {isOwner && (
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                          onClick={() => {
                            setIsEditing(true);
                            setEditText(comment);
                            setShowDropdown(false);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Sửa bình luận
                        </button>
                      )}
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
                        onClick={async () => {
                          setShowDropdown(false);
                          try {
                            await onDelete();
                          } catch (error) {
                            showError("Thao tác đã thất bại. Vui lòng thử lại!");
                          }
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa bình luận
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <button
                className="flex items-center gap-1 hover:text-yellow-600 transition-colors"
                onClick={onLikeToggle}
              >
                <HeartIcon filled={liked_by_me || false} className="w-4 h-4" />
                <span>{likes_count}</span>
              </button>
              <button
                className="flex items-center gap-1 hover:text-yellow-600 transition-colors"
                onClick={handleReplyClick}
              >
                <FaReply className="w-4 h-4" />
                <span>Trả lời</span>
              </button>
              <span className="text-gray-400">{timeAgoVi(created_at.toString())}</span>
            </div>
          </div>

          {showReplyInput && (
            <div className="mt-2">
              <CommentInput
                value={replyText}
                onChange={setReplyText}
                onSubmit={handleReply}
                placeholder="Phản hồi..."
                buttonText="Gửi"
                loading={postingReply}
                autoFocus
                showEmoji
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowNestedReplies(!showNestedReplies)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showNestedReplies ? "Ẩn" : "Xem tất cả"} {replies.length} phản hồi
              </button>
            </div>
          )}
        </div>
      </div>

      {showNestedReplies && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              id={nestedReply.id}
              user={nestedReply.user}
              comment={nestedReply.comment}
              created_at={nestedReply.created_at}
              likes_count={nestedReply.likes_count}
              liked_by_me={nestedReply.liked_by_me ?? false}
              isOwner={currentUser && Number(currentUser.id) === Number(nestedReply.user.id)}
              isPostOwner={false}
              onLikeToggle={() => handleLikeNestedReply(nestedReply.id)}
                             onEdit={async (newText: string) => {
                 await onReplyToReply?.(nestedReply.id, newText);
               }}
                             onDelete={() => handleDeleteNestedReply(nestedReply.id)}
               onReply={(replyText: string) => handleNestedReply(nestedReply.id, replyText)}
              depth={depth + 1}
              replies={nestedReply.replies || []}
              onLoadReplies={onLoadReplies}
              onLoadRepliesForReply={onLoadRepliesForReply}
              onReplyToReply={onReplyToReply}
              onLikeReply={onLikeReply}
              onDeleteReply={onDeleteReply}
              currentUser={currentUser}
              className="border-l-2 border-gray-100 pl-2"
            />
          ))}
        </div>
      )}
    </div>
  );
}
