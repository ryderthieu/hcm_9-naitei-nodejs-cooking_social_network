import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../../../assets/login/background.png";
import bowl from "../../../assets/login/bowl.png";
import logo from "../../../assets/logo.svg";
import type { LoginDto, LoginErrors } from "../../../types/auth.type";
import { login } from "../../../services/auth.service";

const Login = () => {
  const [formData, setFormData] = useState<LoginDto>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [shakeFields, setShakeFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setApiError("");
  };

  const validate = (): LoginErrors => {
    const newErrors: LoginErrors = {};
    const shake: string[] = [];

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
      shake.push("email");
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
      shake.push("email");
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
      shake.push("password");
    }

    setShakeFields(shake);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsLoading(false);
      setShakeFields(Object.keys(validationErrors));

      if (validationErrors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (validationErrors.password && passwordRef.current) {
        passwordRef.current.focus();
      }

      setTimeout(() => setShakeFields([]), 500);
      return;
    }

    try {
      await login(formData);
      navigate("/");
    } catch (error: any) {
      setApiError(error?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animated-bg">
      <div
        className="w-full max-w-6xl flex flex-row rounded-3xl shadow-2xl overflow-hidden border border-white/30 p-6 gap-5 relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-1/2 flex justify-center items-center p-6 min-h-[610px]">
          <img
            src={bowl}
            alt="Fruit Bowl"
            className="max-w-[80%] md:max-w-[70%]"
          />
        </div>

        <div className="w-1/2 flex justify-center items-center p-6">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="SHISHA Logo" className="h-10" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-6 text-center">
              Đăng nhập
            </h2>

            {apiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {apiError}
              </div>
            )}

            <form
              className="space-y-4 flex flex-col mb-6"
              onSubmit={handleSubmit}
            >
              <div>
                <input
                  type="text"
                  placeholder="Email"
                  className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } ${shakeFields.includes("email") ? "animate-shake" : ""}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  ref={emailRef}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs italic ml-2 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } ${shakeFields.includes("password") ? "animate-shake" : ""}`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  ref={passwordRef}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-600 text-xs italic ml-2 mt-1">
                    {errors.password}
                  </p>
                )}
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition duration-300 ease-in-out"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold mt-6 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-sm text-gray-500 font-medium">
                Hoặc tiếp tục với
              </span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <p className="text-sm text-center text-gray-600 mt-6">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium transition duration-300 ease-in-out"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
