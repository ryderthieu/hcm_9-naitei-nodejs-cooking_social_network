import { get } from "./api.service";

export async function getMessages(
  conversationId: number,
  params?: { page?: number; limit?: number }
) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    const response = await get(
      `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
