export interface CommentUserRef {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export interface CommentEntity {
  id: number;
  post_id: number;
  reply_of: number | null;
  replies_count: number;
  likes_count: number;
  user: CommentUserRef;
  comment: string;
  created_at: string | Date;
  liked_by_me?: boolean;
  replies?: CommentEntity[];
}

export interface CommentsResponseMeta {
  total: number;
  page: number;
  limit: number;
}

export interface CommentsResponse {
  comments: CommentEntity[];
  meta: CommentsResponseMeta;
}

export interface RepliesResponse {
  replies: CommentEntity[];
  meta: CommentsResponseMeta;
}

export interface CreateCommentDto {
  comment: string;
  replyOf?: number;
  parent_id?: number;
}

export interface UpdateCommentDto {
  comment: string;
}
