import { post } from "./api.service";

export interface UploadResult {
  url: string;
  publicId?: string;
  height?: number;
  width?: number;
  format?: string;
  resourceType?: "image" | "video" | string;
}

export async function uploadFiles(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const res = await post<UploadResult[]>("/cloudinary/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data as unknown as UploadResult[];
}
