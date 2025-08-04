import { get } from "./api.service";

export async function getCurrentUser() {
  try {
    const response = await get("/users/me");
    return response.data;
  } catch (error) {
    throw error;
  }
}
