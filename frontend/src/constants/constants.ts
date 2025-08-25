export const UI_CONSTANTS = {
  SEARCH_DEBOUNCE_DELAY: 300,
  DROPDOWN_MAX_HEIGHT: 64,
} as const;

export const ERROR_MESSAGES = {
  POST_LOAD_ERROR: "Lỗi tải bài viết",
  INVALID_DATA: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
} as const;

export const LOADING_MESSAGES = {
  LOADING: "Đang tải...",
} as const;

export const PLACEHOLDER_TEXTS = {} as const;

export const LABELS = {
  NO_POSTS: "Chưa có bài viết nào",
  NO_POSTS_DESCRIPTION: "Hãy tạo bài viết đầu tiên để chia sẻ với mọi người",
} as const;

export const BUTTON_TEXTS = {
  LOAD_MORE: "Tải thêm",
} as const;

export const API_CONSTANTS = {
  BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:3000/api",
  TIMEOUT: 10000,
  REFRESH_TIMEOUT: 5000,
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
  SEARCH_LIMIT: 10,
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  PAYLOAD_TOO_LARGE: 413,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER_INFO: "userInfo",
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  TOTAL: 0,
  TOTAL_PAGES: 1,
} as const;

export const API_ERROR_MESSAGES = {
  SERVER_ERROR: "An error occured from server",
  CONNECTION_ERROR: "Cannot connect to server",
  GENERAL_ERROR: "An error occured",
} as const;

export const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/dfaq5hbmx/image/upload/v1749033098/general/bseoimm2ya0utf2duyyu.png";

export const DEFAULT_RECIPE_URL =
  "https://cdn.loveandlemons.com/wp-content/uploads/2024/07/ratatouille.jpg"
