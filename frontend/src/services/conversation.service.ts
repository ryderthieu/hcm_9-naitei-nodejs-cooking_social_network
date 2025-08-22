import { get, post, put } from "./api.service";

export async function getConversations() {
  try {
    const response = await get("/conversations");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getConversation(id: number) {
  try {
    const response = await get(`/conversations/${id}`);
    return response.data.conversation;
  } catch (error) {
    throw error;
  }
}

export async function createConversation(data: {
  members: number[];
  name?: string;
  avatar?: string;
}) {
  try {
    const response = await post("/conversations", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateConversation(
  id: number,
  data: {
    name?: string;
    avatar?: string;
  }
) {
  try {
    const response = await put(`/conversations/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
