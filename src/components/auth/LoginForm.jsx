import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { showToast } from "../common/ToastMessage";

export default function LoginForm({ setActiveForm }) {
  const [formData, setFormData] = useState({ tai_khoan: "", mat_khau: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      const state = {
        toastMessage: "Đăng nhập thành công!",
        toastType: "success",
      };

      if (Number(data.user.role) === 2) {
        navigate("/admin", { state });
      } else if (Number(data.user.role) === 1) {
        navigate("/chu-san", { state });
      } else {
        navigate("/trang-chu", { state });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="mb-8 text-center">
        <h1 className="mb-1 text-2xl font-bold text-[#0a192f]">
          Chào mừng trở lại!
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Đăng nhập để tiếp tục đặt sân
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-regular fa-user mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="text"
            name="tai_khoan"
            value={formData.tai_khoan}
            onChange={handleChange}
            placeholder="Nhập email hoặc số điện thoại"
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>

        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-solid fa-lock mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="password"
            name="mat_khau"
            value={formData.mat_khau}
            onChange={handleChange}
            placeholder="Mật khẩu"
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>

        <div className="pt-1 text-right">
          <button
            type="button"
            onClick={() => setActiveForm("forgot")}
            className="text-sm font-medium text-[#349DFF] hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-4 w-full rounded-xl bg-[#349DFF] py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-xs font-medium text-gray-400">hoặc</span>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <div className="text-center text-sm font-medium text-[#0a192f]">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={() => setActiveForm("register")}
          className="ml-1 font-bold text-[#349DFF] hover:underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
}
