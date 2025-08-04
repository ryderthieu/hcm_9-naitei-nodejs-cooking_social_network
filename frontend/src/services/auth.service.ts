import { clearAuth, post, setAccessToken } from "./api.service";
import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from "../types/auth.type";

export async function register(registerDto: RegisterDto) {
  try {
    const response = await post("/auth/register", { user: registerDto });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function login(loginDto: LoginDto) {
  try {
    const response = await post("/auth/login", { user: loginDto });
    setAccessToken(response.data.accessToken);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    const response = await post("/auth/logout");
    clearAuth();
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
  try {
    const response = await post("/auth/forgot-password", {
      email: forgotPasswordDto.email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function verifyOtp(verifyOtpDto: VerifyOtpDto) {
  try {
    const response = await post("/auth/verify", {
      email: verifyOtpDto.email,
      otp: verifyOtpDto.otp,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(resetPasswordDto: ResetPasswordDto) {
  try {
    const response = await post("/auth/reset-password", {
      email: resetPasswordDto.email,
      otp: resetPasswordDto.otp,
      password: resetPasswordDto.password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
