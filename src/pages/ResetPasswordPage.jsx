import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function ResetPasswordPage() {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
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
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp");
    }

    setLoading(true);
    try {
      await api.post("/auth/dat-lai-mat-khau", {
        email: userEmail,
        mat_khau_moi: passwordData.newPassword,
        xac_nhan_mat_khau: passwordData.confirmPassword,
      });

      alert("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative text-[#0a192f] min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100">
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl w-full max-w-[480px] rounded-3xl shadow-2xl border border-white p-8 sm:p-10">
        <div className="flex justify-center items-center gap-3 mb-8 text-[#0a192f] font-bold text-2xl tracking-tight">
          <div className="w-10 h-10 rounded-full bg-[#eef3ff] flex items-center justify-center text-[#349DFF] shadow-sm">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8.5 2.5a15.3 15.3 0 0 1 0 19"></path>
              <path d="M15.5 2.5a15.3 15.3 0 0 0 0 19"></path>
            </svg>
          </div>
          <div>BadmintonBooking</div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0a192f] mb-2">
              Thiết lập mật khẩu mới
            </h1>
            <p className="text-sm text-gray-500">
              Vui lòng tạo mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center border-b-2 border-gray-200 py-2 bg-gray-50 cursor-not-allowed">
              <i className="fa-regular fa-user text-gray-400 text-lg w-6 text-center mr-3"></i>
              <input
                type="text"
                value={userEmail}
                readOnly
                className="w-full bg-transparent outline-none text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
              <i className="fa-solid fa-lock text-gray-500 text-lg w-6 text-center mr-3"></i>
              <input
                type="password"
                name="newPassword"
                placeholder="Mật khẩu mới"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
              <i className="fa-solid fa-shield-halved text-gray-500 text-lg w-6 text-center mr-3"></i>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#349DFF] text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm mt-6 disabled:bg-blue-300"
            >
              <i className="fa-regular fa-floppy-disk"></i>{" "}
              {loading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
