import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { showToast } from "../common/ToastMessage";

export default function ForgotPasswordForm({ setActiveForm }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/quen-mat-khau", { email });
      showToast("Mã xác minh đã được gửi đến email của bạn", "success");
      navigate("/xac-minh-otp", { state: { email } });
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-[#0a192f]">
          Quên mật khẩu
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Nhập email để nhận mã xác minh đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-regular fa-envelope mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email"
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#349DFF] py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-blue-300"
        >
          <i className="fa-regular fa-paper-plane"></i>
          {loading ? "Đang gửi..." : "Gửi mã xác minh"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-xs font-medium text-gray-400">hoặc</span>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <button
        onClick={() => setActiveForm("login")}
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        <i className="fa-solid fa-arrow-left text-xs"></i>
        Quay lại đăng nhập
      </button>
    </div>
  );
}
