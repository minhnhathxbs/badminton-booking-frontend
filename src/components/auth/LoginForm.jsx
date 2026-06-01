import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function LoginForm({ setActiveForm }) {
  const [formData, setFormData] = useState({ tai_khoan: "", mat_khau: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "error" });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Chuyển trang ngay lập tức kèm theo dữ liệu thông báo (state)
      if (data.user.role === 3) {
        navigate("/admin", {
          state: {
            toastMessage: "Đăng nhập thành công!",
            toastType: "success",
          },
        });
      } else if (data.user.role === 2) {
        navigate("/chu-san", {
          state: {
            toastMessage: "Đăng nhập thành công!",
            toastType: "success",
          },
        });
      } else {
        navigate("/trang-chu", {
          state: {
            toastMessage: "Đăng nhập thành công!",
            toastType: "success",
          },
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
      setLoading(false);
    }
  };

  return (
    <>
      {toast.show && (
        <div
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-50 flex items-center px-6 py-3.5 rounded-xl shadow-2xl transition-all duration-300 animate-fade-in ${
            toast.type === "success"
              ? "bg-[#10B981] text-white"
              : "bg-[#EF4444] text-white"
          }`}
        >
          <i
            className={`mr-3 text-lg ${toast.type === "success" ? "fa-regular fa-circle-check" : "fa-solid fa-circle-exclamation"}`}
          ></i>
          <span className="font-medium text-sm tracking-wide">
            {toast.message}
          </span>
        </div>
      )}

      <div className="space-y-6 relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0a192f] mb-1">
            Chào mừng trở lại!!
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Đăng nhập để tiếp tục đặt sân
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
            <i className="fa-regular fa-user text-gray-500 text-lg w-6 text-center mr-3"></i>
            <input
              type="text"
              name="tai_khoan"
              value={formData.tai_khoan}
              onChange={handleChange}
              placeholder="Nhập Email hoặc Số điện thoại"
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              required
            />
          </div>

          <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
            <i className="fa-solid fa-lock text-gray-500 text-lg w-6 text-center mr-3"></i>
            <input
              type="password"
              name="mat_khau"
              value={formData.mat_khau}
              onChange={handleChange}
              placeholder="Mật khẩu"
              className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              required
            />
          </div>

          <div className="text-right pt-1">
            <button
              type="button"
              onClick={() => setActiveForm("forgot")}
              className="text-[#349DFF] text-sm font-medium hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#349DFF] text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-600 transition-colors text-sm mt-4 disabled:bg-blue-300"
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium">hoặc</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="text-center text-sm text-[#0a192f] font-medium">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => setActiveForm("register")}
            className="text-[#349DFF] font-bold hover:underline ml-1"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </>
  );
}
