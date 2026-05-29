import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ForgotPasswordForm({ setActiveForm }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/quen-mat-khau", { email });
      navigate("/xac-minh-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0a192f] mb-2">
          Quên Mật Khẩu
        </h1>
        <p className="text-sm text-gray-500">
          Vui lòng nhập Email để nhận mã xác minh.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
          <i className="fa-regular fa-envelope text-gray-500 text-lg w-6 text-center mr-3"></i>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ Email"
            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#349DFF] text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm mt-4 disabled:bg-blue-300"
        >
          <i className="fa-regular fa-paper-plane"></i>{" "}
          {loading ? "Đang gửi..." : "Gửi mã xác minh"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs text-gray-400 font-medium">hoặc</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <button
        onClick={() => setActiveForm("login")}
        type="button"
        className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
      >
        <i className="fa-solid fa-arrow-left text-xs"></i> Quay lại đăng nhập
      </button>
    </div>
  );
}
