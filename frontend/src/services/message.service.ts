import type { MessageType } from "../types/conversation.type";
import { get } from "./api.service";

export async function getMessages(
  conversationId: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    from?: Date;
    to?: Date;
    senderId?: number;
    type?: MessageType;
  }
) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.from) query.set("from", params.from.toISOString());
    if (params?.to) query.set("to", params.to.toISOString());
    if (params?.senderId) query.set("senderId", String(params.senderId));
    if (params?.type) query.set("type", params.type);
    const qs = query.toString();
    const response = await get(
      `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMessageContext(
  conversationId: number,
  messageId: number,
  params?: { before?: number; after?: number }
) {
  try {
    const query = new URLSearchParams();
    if (params?.before !== undefined && params.before !== null)
      query.set("before", String(params.before));
    if (params?.after !== undefined && params.after !== null)
      query.set("after", String(params.after));
    const qs = query.toString();
    const response = await get(
      `/conversations/${conversationId}/messages/${messageId}/context${
        qs ? `?${qs}` : ""
      }`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
