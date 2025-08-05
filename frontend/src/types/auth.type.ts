export interface RegisterDto {
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  username: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export interface User {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextProps {
  user: User | null;
  login: (loginDto: LoginDto) => Promise<void>;
  logout: () => void;
}
