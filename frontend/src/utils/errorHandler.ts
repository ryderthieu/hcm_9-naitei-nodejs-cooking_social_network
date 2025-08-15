export const handleError = (
  error: any,
  defaultMessage: string = "Đã xảy ra lỗi. Vui lòng thử lại!"
) => {
  console.error("Error:", error);

  if (error && typeof error === "object") {
    if (error.message) {
      return error.message;
    }
    if (error.status === 413) {
      return "Dữ liệu quá lớn! Vui lòng giảm kích thước ảnh/video hoặc chọn ít file hơn.";
    }
    if (error.status === 400) {
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
    }
    if (error.status === 401) {
      return "Bạn cần đăng nhập để thực hiện thao tác này.";
    }
  }

  return defaultMessage;
};

export const showErrorAlert = (
  error: any,
  defaultMessage: string = "Đã xảy ra lỗi. Vui lòng thử lại!"
) => {
  const message = handleError(error, defaultMessage);
  alert(message);
};

export const showSuccessAlert = (message: string) => {
  alert(message);
};

export const confirmAction = (message: string): boolean => {
  return confirm(message);
};
