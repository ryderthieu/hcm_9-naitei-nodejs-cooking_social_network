import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import bgImage from "../../../assets/register/background.png";
import bowl from "../../../assets/register/bowl.png";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../../services/auth.service";
import type { RegisterDto } from "../../../types/auth.type";

interface FormData extends RegisterDto {
  confirmPassword: string;
  agree: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  agree?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<string>("register");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    agree: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [shakeFields, setShakeFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const agreeRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    const shake: string[] = [];

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
      shake.push("email");
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
      shake.push("email");
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
      shake.push("password");
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải ít nhất 6 ký tự.";
      shake.push("password");
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      shake.push("confirmPassword");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập họ.";
      shake.push("lastName");
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vui lòng nhập tên.";
      shake.push("firstName");
    }

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập.";
      shake.push("username");
    }

    if (!formData.agree) {
      newErrors.agree = "Bạn cần đồng ý với điều khoản.";
      shake.push("agree");
    }

    setShakeFields(shake);
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setApiError("");
      try {
        const userData: RegisterDto = {
          email: formData.email,
          password: formData.password,
          lastName: formData.lastName,
          firstName: formData.firstName,
          username: formData.username,
        };
        await register(userData);
        setStep("success");
        setMessage(
          "Đăng ký tài khoản thành công! Bạn sẽ được chuyển hướng tới trang đăng nhập."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error: any) {
        console.log(error);
        setApiError(error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    } else {
      const firstError = Object.values(newErrors)[0];
      setApiError(firstError || "");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animated-bg">
      <div
        className="w-full max-w-6xl flex flex-row rounded-3xl shadow-2xl overflow-hidden border border-pink-200/30 p-6 gap-5 relative bg-gradient-to-br from-pink-50 to-orange-50"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-1/2 flex justify-center items-center p-6 ">
          <img
            src={bowl}
            alt="Fruit Bowl"
            className="max-w-[80%] md:max-w-[70%]"
          />
        </div>

        <div className="w-1/2 flex justify-center items-center p-6  min-h-[610px]">
          <div className="w-full max-w-md">
            {step === "register" && (
              <>
                <h2 className="text-3xl font-bold text-black mb-6 text-center">
                  Tạo tài khoản mới
                </h2>

                {apiError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {apiError}
                  </div>
                )}

                <form
                  className="space-y-4 flex flex-col"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <input
                      ref={emailRef}
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } ${
                        shakeFields.includes("email") ? "animate-shake" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <input
                      ref={passwordRef}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mật khẩu"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } ${
                        shakeFields.includes("password") ? "animate-shake" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <input
                      ref={confirmPasswordRef}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Xác nhận mật khẩu"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        shakeFields.includes("confirmPassword")
                          ? "animate-shake"
                          : ""
                      }`}
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        ref={lastNameRef}
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Họ"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        } ${
                          shakeFields.includes("lastName")
                            ? "animate-shake"
                            : ""
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        ref={firstNameRef}
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Tên"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        } ${
                          shakeFields.includes("firstName")
                            ? "animate-shake"
                            : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      ref={usernameRef}
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Tên đăng nhập"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-lg bg-white/90 border transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                        errors.username ? "border-red-500" : "border-gray-300"
                      } ${
                        shakeFields.includes("username") ? "animate-shake" : ""
                      }`}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-1 ml-1 self-start">
                    <input
                      ref={agreeRef}
                      type="checkbox"
                      id="agree"
                      name="agree"
                      checked={formData.agree}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`form-checkbox h-4 w-4 text-pink-600 transition duration-150 ease-in-out border rounded ${
                        errors.agree ? "border-red-500" : "border-gray-300"
                      } ${
                        shakeFields.includes("agree") ? "animate-shake" : ""
                      } focus:ring-pink-500`}
                    />
                    <label
                      htmlFor="agree"
                      className="text-sm text-gray-700 select-none"
                    >
                      Tôi đồng ý với các điều khoản của SHISHA
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold mt-6 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng ký"}
                  </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-6">
                  Bạn đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-pink-600 hover:text-pink-800 font-medium transition duration-300 ease-in-out"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </>
            )}

            {step === "success" && (
              <>
                <h2 className="text-3xl font-bold text-black mb-6 text-center">
                  Thành Công!
                </h2>
                {message && (
                  <div
                    className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <span className="block sm:inline">{message}</span>
                  </div>
                )}
                <p className="text-sm text-center text-gray-600 mt-6">
                  <Link
                    to="/login"
                    className="text-pink-600 hover:text-pink-800 font-medium transition duration-300 ease-in-out"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
