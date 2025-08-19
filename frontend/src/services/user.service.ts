import { get, post, del, put } from "./api.service";
import type { UserProfile } from "../types/user.type";

export async function getCurrentUser() {
  try {
    const response = await get("/users/me");
    return response.data.user;
  } catch (error) {
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  try {
    const response = await get(`/users/${username}`);
    return response.data.user;
  } catch (error) {
    throw error;
  }
}

export async function getUserStats(username: string) {
  try {
    const user = await getUserByUsername(username);
    return {
      posts: { count: user.postsCount || 0 },
      recipes: { count: user.recipesCount || 0 },
      saved: { count: user.savedPostsCount || 0 },
      followers: { count: user.followers || 0 },
      following: { count: user.followings || 0 },
    };
  } catch (error) {
    throw error;
  }
}

export async function followUser(username: string) {
  const response = await post(`/users/${username}/follow`);
  return response.data;
}

export async function unfollowUser(username: string) {
  const response = await del(`/users/${username}/follow`);
  return response.data;
}

export async function toggleFollow(username: string) {
  try {
    const user = await getUserByUsername(username);
    if (user.isFollowing) {
      return await unfollowUser(username);
    } else {
      return await followUser(username);
    }
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(formData: UserProfile) {
  try {
    const response = await put("/users/profile", formData);
    return response.data.user;
  } catch (error) {
    throw error;
  }
}

export async function searchUsers(query: string) {
  try {
    const response = await get(`/users?name=${encodeURIComponent(query)}&limit=10`);
    return response.data.users;
  } catch (error) {
    throw error;
  }
}

export async function getUserById(userId: number) {
  try {
    const response = await get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
