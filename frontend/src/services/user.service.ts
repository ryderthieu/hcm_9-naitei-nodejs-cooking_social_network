import { get, post, del } from "./api.service";

export async function getCurrentUser() {
  try {
    const response = await get("/users/me");
    return response.data.user;
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

export async function followUser(username: string) {
  const response = await post(`/users/${username}/follow`);
  return response.data;
}

export async function unfollowUser(username: string) {
  const response = await del(`/users/${username}/follow`);
  return response.data;
}

export async function searchUsers(query: string) {
  try {
    const response = await get(`/users?name=${encodeURIComponent(query)}&limit=10`);
    return response.data.users;
  } catch (error) {
    throw error;
  }
}


