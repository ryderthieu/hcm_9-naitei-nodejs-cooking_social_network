import type { PostEntity } from "../types/post.type";

export const getPreviewImage = (post: PostEntity) => {
  if (post.media && post.media.length > 0) {
    if (post.media[0].type === "IMAGE") {
      return post.media[0].url;
    }
    if (post.media[0].type === "VIDEO") {
      return post.media[0].url.replace(".mp4", ".jpg");
    }
  }
  return "";
};
