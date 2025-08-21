import { useEffect, useRef, useState } from "react";
import { MdEdit } from "react-icons/md";
import { useAuth } from "../../../contexts/AuthContext";
import { getCurrentUser, updateUserProfile } from "../../../services/user.service";
import { uploadFiles } from "../../../services/upload.service";
import { forgotPassword, resetPassword, verifyOtp } from "../../../services/auth.service";
import { showErrorAlert, showSuccessAlert } from "../../../utils/errorHandler";
import defaultAvatar from "../../../assets/avatar-default.svg";

export default function AccountPage() {
  useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    avatar: "",
    gender: "" as "MALE" | "FEMALE" | "",
    birthday: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [original, setOriginal] = useState<typeof form | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const originalEmailRef = useRef<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser();
        const next: typeof form = {
          firstName: current?.firstName || "",
          lastName: current?.lastName || "",
          username: current?.username || "",
          email: current?.email || "",
          bio: current?.bio || "",
          avatar: current?.avatar || "",
          gender: (current?.gender === "Nam" ? "MALE" : current?.gender === "Nữ" ? "FEMALE" : ""),
          birthday: current?.birthday ? current.birthday.replace(/\//g, "-") : "",
        };
        setForm(next);
        setOriginal(next);
        originalEmailRef.current = current?.email || "";
      } catch (error) {
        showErrorAlert(error, "Không thể tải thông tin tài khoản");
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadAvatar = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    try {
      const results = await uploadFiles(Array.from(fileList));
      const url = results?.[0]?.url;
      if (url) setForm((prev) => ({ ...prev, avatar: url }));
    } catch (error) {
      showErrorAlert(error, "Tải ảnh không thành công");
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.firstName?.trim()) nextErrors.firstName = "Bắt buộc";
    if (!form.lastName?.trim()) nextErrors.lastName = "Bắt buộc";
    if (!form.username?.trim()) nextErrors.username = "Bắt buộc";
    if (!form.email?.trim()) nextErrors.email = "Bắt buộc";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      await updateUserProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        bio: form.bio,
        avatar: form.avatar,
        gender: (form.gender) || undefined,
        birthday: form.birthday || undefined,
      });
      showSuccessAlert("Cập nhật thông tin thành công!");
      setOriginal(form);
      setIsEditing(false);
    } catch (error) {
      showErrorAlert(error, "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      const emailToUse = form.email || originalEmailRef.current;
      if (!emailToUse) {
        showErrorAlert(null, "Không tìm thấy email để gửi OTP");
        return;
      }
      await forgotPassword({ email: emailToUse });
      showSuccessAlert("Đã gửi OTP tới email của bạn");
    } catch (error) {
      showErrorAlert(error, "Không gửi được mã OTP. Vui lòng thử lại");
    } finally {
      setSendingOtp(false);
    }
  };

  const passwordMeetsRules = (pwd: string) => {
    const hasMinLength = pwd.length >= 6;
    const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(pwd);
    return hasMinLength && complexity;
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailToUse = form.email || originalEmailRef.current;
      if (!emailToUse) {
        showErrorAlert(null, "Không tìm thấy email để xác thực");
        return;
      }
      await verifyOtp({ email: emailToUse, otp });
      await resetPassword({
        email: emailToUse,
        password: newPassword,
        confirmPassword: confirmPassword,
      });
      await updateUserProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        bio: form.bio,
        avatar: form.avatar,
        gender: (form.gender) || undefined,
        birthday: form.birthday || undefined,
      });
      showSuccessAlert("Đổi mật khẩu và cập nhật hồ sơ thành công!");
      setShowPasswordModal(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showErrorAlert(error, "OTP không đúng hoặc đã hết hạn");
    }
  };

  return (
    <div className="px-[110px] bg-[#F5F1E8] min-h-screen">
      <div className="flex gap-4 pt-[30px] pb-[10px]">
        <div className="bg-white rounded-2xl w-[70%] shadow-lg border border-gray-200">
          <div className="relative p-6">
            <div className="w-full h-[180px] rounded-2xl bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 shadow-md"></div>
            <div>
              <img
                src={form.avatar || defaultAvatar}
                className="bg-white rounded-full w-[120px] h-[120px] absolute bottom-[-60px] left-[50px] border-4 border-white object-cover shadow-lg"
                alt="avatar"
              />
              <div className="flex items-center gap-4 absolute bottom-[-30px] left-[180px]">
                <h4 className="font-bold text-[22px] text-gray-800">
                  {form.lastName} {form.firstName}
                </h4>
                <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                  <MdEdit className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleUploadAvatar(e.target.files)}
                  />
                  Đổi ảnh
                </label>
              </div>
            </div>
          </div>
          <div className="mt-[70px] mx-[40px] p-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] text-gray-700">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 mb-2 text-sm font-medium">Họ và tên</div>
                  <div className="font-semibold text-gray-900">{form.lastName} {form.firstName}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 mb-2 text-sm font-medium">Username</div>
                  <div className="font-semibold text-gray-900">{form.username}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 mb-2 text-sm font-medium">Email</div>
                  <div className="font-semibold text-gray-900">{form.email}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 mb-2 text-sm font-medium">Giới tính</div>
                  <div className="font-semibold text-gray-900">{form.gender === "MALE" ? "Nam" : form.gender === "FEMALE" ? "Nữ" : "-"}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 mb-2 text-sm font-medium">Ngày sinh</div>
                  <div className="font-semibold text-gray-900">{form.birthday || "-"}</div>
                </div>
                <div className="md:col-span-2 bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-500 mb-2 text-sm font-medium">Giới thiệu</div>
                  <div className="font-semibold text-gray-900 whitespace-pre-line">{form.bio || "-"}</div>
                </div>
                <div className="md:col-span-2 mt-4 flex gap-3 justify-end">
                  <button 
                    onClick={() => setShowPasswordModal(true)} 
                    className="px-6 py-3 border-2 border-orange-300 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 font-medium text-orange-600"
                  >
                    Đổi mật khẩu
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-6 py-3 rounded-xl hover:from-orange-500 hover:to-yellow-500 transition-all duration-200 font-medium shadow-md"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Họ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  />
                  {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  />
                  {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Username <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  />
                  {errors.username && <span className="text-xs text-red-500 mt-1">{errors.username}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  />
                  {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Giới tính</label>
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Ngày sinh</label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => handleChange("birthday", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm text-gray-600 mb-2 font-medium">Giới thiệu</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 min-h-20"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between w-full">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); if (original) setForm(original); setErrors({}); }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-6 py-3 rounded-xl hover:from-orange-500 hover:to-yellow-500 transition-all duration-200 font-medium shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
            )}

            {showPasswordModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <form onSubmit={handleConfirmOtp} className="bg-white p-8 rounded-2xl shadow-2xl border border-orange-100 w-full max-w-md">
                  <h4 className="font-bold text-xl mb-6 text-center text-gray-800">Đổi mật khẩu</h4>

                  <div className="mb-4 text-sm text-gray-600 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    Mật khẩu mới phải tối thiểu 6 ký tự và bao gồm: chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&).
                  </div>

                  <div className="flex flex-col mb-4">
                    <label className="text-sm text-gray-600 mb-2 font-medium">Mật khẩu mới <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="flex flex-col mb-4">
                    <label className="text-sm text-gray-600 mb-2 font-medium">Nhập lại mật khẩu mới <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 mb-2 block font-medium">Mã OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="border-2 border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                        placeholder="Nhập mã OTP"
                      />
                    </div>
                    <button type="button" onClick={handleSendOtp} className="mt-6 px-4 py-3 border-2 border-orange-300 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 font-medium text-orange-600" disabled={sendingOtp}>
                      {sendingOtp ? "Đang gửi..." : "Gửi OTP"}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className={`flex items-center gap-2 ${newPassword.length >= 6 ? "text-green-600" : ""}`}>
                        <span className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? "bg-green-500" : "bg-gray-300"}`}></span>
                        Tối thiểu 6 ký tự
                      </li>
                      <li className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? "text-green-600" : ""}`}>
                        <span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                        Có ít nhất 1 chữ hoa
                      </li>
                      <li className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) ? "text-green-600" : ""}`}>
                        <span className={`w-2 h-2 rounded-full ${/[a-z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                        Có ít nhất 1 chữ thường
                      </li>
                      <li className={`flex items-center gap-2 ${/\d/.test(newPassword) ? "text-green-600" : ""}`}>
                        <span className={`w-2 h-2 rounded-full ${/\d/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                        Có ít nhất 1 số
                      </li>
                      <li className={`flex items-center gap-2 ${/[@$!%*?&]/.test(newPassword) ? "text-green-600" : ""}`}>
                        <span className={`w-2 h-2 rounded-full ${/[@$!%*?&]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"}`}></span>
                        Có ít nhất 1 ký tự đặc biệt
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium w-1/2">Hủy</button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-4 py-3 rounded-xl hover:from-orange-500 hover:to-yellow-500 transition-all duration-200 font-medium shadow-md w-1/2 disabled:opacity-50"
                      disabled={!passwordMeetsRules(newPassword) || newPassword !== confirmPassword || !otp}
                    >
                      Xác nhận
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="w-[30%] space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 h-[330px]">
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              Phiên bản cập nhật
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                <p className="text-sm text-gray-700 font-medium">v2.3.1</p>
                <p className="text-xs text-gray-600 mt-1">Cập nhật giao diện người dùng và sửa lỗi bảo mật.</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                <p className="text-sm text-gray-700 font-medium">v2.3.0</p>
                <p className="text-xs text-gray-600 mt-1">Thêm tính năng tìm kiếm nâng cao và tối ưu hóa hiệu suất.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-sm text-gray-700 font-medium">v2.2.0</p>
                <p className="text-xs text-gray-600 mt-1">Cải thiện tốc độ tải trang và sửa lỗi nhỏ.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 h-[240px]">
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Thông báo
            </h3>
            <div className="space-y-3">
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <p className="text-sm text-gray-700 font-medium">Bảo trì hệ thống</p>
                <p className="text-xs text-gray-600 mt-1">Hệ thống sẽ bảo trì vào lúc 02:00 sáng mai.</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-sm text-gray-700 font-medium">Cập nhật giao diện</p>
                <p className="text-xs text-gray-600 mt-1">Cập nhật phiên bản giao diện người dùng mới.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


