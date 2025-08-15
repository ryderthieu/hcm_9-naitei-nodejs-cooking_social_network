export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "Vui lòng nhập email.";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Email không hợp lệ.";
  }
  return null;
};

export const validatePassword = (password: string, minLength: number = 6): string | null => {
  if (!password) {
    return "Vui lòng nhập mật khẩu.";
  }
  if (password.length < minLength) {
    return `Mật khẩu phải có ít nhất ${minLength} ký tự.`;
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `Vui lòng nhập ${fieldName}.`;
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return "Vui lòng xác nhận mật khẩu.";
  }
  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp.";
  }
  return null;
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  shakeFields: string[];
}

export const createValidator = () => {
  const errors: Record<string, string> = {};
  const shakeFields: string[] = [];

  const addError = (field: string, message: string) => {
    errors[field] = message;
    shakeFields.push(field);
  };

  const validate = (field: string, value: string, validator: (value: string) => string | null) => {
    const error = validator(value);
    if (error) {
      addError(field, error);
    }
  };

  const getResult = (): ValidationResult => ({
    isValid: Object.keys(errors).length === 0,
    errors,
    shakeFields
  });

  return {
    validate,
    addError,
    getResult
  };
};
