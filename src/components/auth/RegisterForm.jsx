import React, { useState } from "react";
import api from "../../api/axios";

export default function RegisterForm({ setActiveForm }) {
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    xac_nhan_mat_khau: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.mat_khau !== formData.xac_nhan_mat_khau) {
      return setError("Mật khẩu xác nhận không khớp");
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        ho_ten: formData.ho_ten,
        email: formData.email,
        so_dien_thoai: formData.so_dien_thoai,
        mat_khau: formData.mat_khau,
      });

      setActiveForm("login", {
        toastMessage: "Đăng ký thành công! Vui lòng đăng nhập.",
        toastType: "success",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#0a192f] mb-1">
          Tạo tài khoản mới
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Bắt đầu hành trình mới cùng chúng tôi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
          <i className="fa-regular fa-user text-gray-500 text-lg w-6 text-center mr-3"></i>
          <input
            type="text"
            name="ho_ten"
            value={formData.ho_ten}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            required
          />
        </div>

        <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
          <i className="fa-regular fa-envelope text-gray-500 text-lg w-6 text-center mr-3"></i>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            required
          />
        </div>

        <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
          <i className="fa-solid fa-phone text-gray-500 text-lg w-6 text-center mr-3"></i>
          <input
            type="tel"
            name="so_dien_thoai"
            value={formData.so_dien_thoai}
            onChange={handleChange}
            placeholder="Số điện thoại"
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

        <div className="flex items-center border-b-2 border-gray-200 py-2 focus-within:border-[#349DFF] transition-colors">
          <i className="fa-solid fa-shield-halved text-gray-500 text-lg w-6 text-center mr-3"></i>
          <input
            type="password"
            name="xac_nhan_mat_khau"
            value={formData.xac_nhan_mat_khau}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#349DFF] text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-600 transition-colors text-sm mt-6 disabled:bg-blue-300"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs text-gray-400 font-medium">hoặc</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      <div className="text-center text-sm text-[#0a192f] font-medium">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => setActiveForm("login")}
          className="text-[#349DFF] font-bold hover:underline ml-1"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
}
