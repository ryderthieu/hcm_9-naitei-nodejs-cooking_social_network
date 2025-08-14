export type MediaType = "IMAGE" | "VIDEO";

export interface PostAuthor {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
  username?: string;
}

export interface PostRecipeRef {
  id: number;
  title: string;
  slug: string | null;
}

export interface PostMedia {
  url: string;
  type: MediaType;
}

export interface PostEntity {
  id: number;
  author: PostAuthor;
  caption: string;
  recipe: PostRecipeRef;
  media?: PostMedia[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count?: number;
  slug: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  liked_by_me?: boolean;
  saved_by_me?: boolean;
  following_author?: boolean;
}

export interface PostResponse {
  post: PostEntity;
}

export interface PostsResponseMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PostsResponse {
  posts: PostEntity[];
  meta: PostsResponseMeta;
}

export interface FilterPostsDto {
  keyword?: string;
  following?: boolean;
  savedBy?: boolean;
  authorId?: number;
  sortBy?: "newest" | "oldest";
  limit?: number;
  page?: number;
}



export interface UpdatePostDto {
  caption?: string;
}
