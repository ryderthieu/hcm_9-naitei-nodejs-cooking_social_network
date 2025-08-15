import { del, get, post, put } from "./api.service";
import type {
  CommentsResponse,
  CreateCommentDto,
  RepliesResponse,
  UpdateCommentDto,
} from "../types/comment.type";

function buildQuery(params?: Record<string, any>) {
  const q = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q.set(k, String(v));
    });
  }
  return q.size ? `?${q}` : "";
}

export async function fetchComments(postId: number, params?: { page?: number; limit?: number; sortBy?: "newest" | "oldest" }) {
  const query = buildQuery(params);
  const res = await get<CommentsResponse>(`/posts/${postId}/comments${query}`);
  return res.data;
}

export async function fetchReplies(postId: number, commentId: number, params?: { page?: number; limit?: number; sortBy?: "newest" | "oldest" }) {
  const query = buildQuery(params);
  const res = await get<RepliesResponse>(`/posts/${postId}/comments/${commentId}/replies${query}`);
  return res.data;
}

export async function createComment(postId: number, dto: CreateCommentDto) {
  const payload = {
    comment: {
      comment: dto.comment,
      ...(dto.replyOf !== undefined && { replyOf: dto.replyOf })
    }
  };
  
  const res = await post<{ comment: any }>(`/posts/${postId}/comments`, payload);
  return res.data;
}

export async function updateComment(postId: number, commentId: number, dto: UpdateCommentDto) {
  const res = await put<{ comment: any }>(`/posts/${postId}/comments/${commentId}`, { comment: { comment: dto.comment } });
  return res.data;
}

export async function deleteComment(postId: number, commentId: number) {
  const res = await del<{ message: string }>(`/posts/${postId}/comments/${commentId}`);
  return res.data;
}

export async function likeComment(postId: number, commentId: number) {
  const res = await post<{ message: string }>(`/posts/${postId}/comments/${commentId}/like`);
  return res.data;
}

export async function unlikeComment(postId: number, commentId: number) {
  const res = await del<{ message: string }>(`/posts/${postId}/comments/${commentId}/like`);
  return res.data;
}
