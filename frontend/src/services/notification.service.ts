import { get, post } from "./api.service";

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const response = await get(`/notifications${qs ? `?${qs}` : ""}`);
  return response.data;
}

export async function markAsRead(notificationId: number) {
  const response = await post(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await post("/notifications/read-all");
  return response.data;
}
