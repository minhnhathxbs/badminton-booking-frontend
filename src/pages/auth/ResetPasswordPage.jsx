import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const PASSWORD_MESSAGE =
  "Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ và 1 số";

const isValidPassword = (value) =>
  value.length >= 8 && /[A-Za-zÀ-ỹ]/.test(value) && /\d/.test(value);

export default function ResetPasswordPage() {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = location.state?.email || "";

  useEffect(() => {
    if (!userEmail) navigate("/login");
  }, [userEmail, navigate]);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    if (!isValidPassword(passwordData.newPassword)) {
      showToast(PASSWORD_MESSAGE, "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/dat-lai-mat-khau", {
        email: userEmail,
        mat_khau_moi: passwordData.newPassword,
        xac_nhan_mat_khau: passwordData.confirmPassword,
      });

      navigate("/login", {
        state: {
          toastMessage: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.",
          toastType: "success",
        },
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 p-4 font-sans text-[#0a192f] sm:p-6">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[35rem] w-[35rem] rounded-full bg-blue-500/30 blur-[100px]"></div>
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/30 blur-[120px]"></div>
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[25rem] w-[25rem] rounded-full bg-cyan-400/20 blur-[90px]"></div>

      <div className="relative z-10 w-full max-w-[480px] rounded-3xl border border-white bg-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-[#0a192f]">
          <img src="/logo.png" alt="BadmintonBooking" className="h-12 w-auto object-contain" />
          <span>BadmintonBooking</span>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-[#0a192f]">
              Thiết lập mật khẩu mới
            </h1>
            <p className="text-sm text-gray-500">
              Tạo mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="flex cursor-not-allowed items-center border-b-2 border-gray-200 bg-gray-50 py-2">
              <i className="fa-regular fa-user mr-3 w-6 text-center text-lg text-gray-400"></i>
              <input
                type="text"
                value={userEmail}
                readOnly
                className="w-full cursor-not-allowed bg-transparent text-sm text-gray-500 outline-none"
              />
            </div>

            <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
              <i className="fa-solid fa-lock mr-3 w-6 text-center text-lg text-gray-500"></i>
              <input
                type="password"
                name="newPassword"
                placeholder="Mật khẩu mới"
                value={passwordData.newPassword}
                onChange={handleChange}
                minLength={8}
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                required
              />
            </div>
            <p className="-mt-4 text-xs text-gray-500">{PASSWORD_MESSAGE}</p>

            <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
              <i className="fa-solid fa-shield-halved mr-3 w-6 text-center text-lg text-gray-500"></i>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#349DFF] py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-blue-300"
            >
              <i className="fa-regular fa-floppy-disk"></i>
              {loading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
