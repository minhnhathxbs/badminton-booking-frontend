import { useState } from "react";
import api from "../../api/axios";
import { showToast } from "../common/ToastMessage";

const PASSWORD_MESSAGE =
  "Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ và 1 số";

const isValidPassword = (value) =>
  value.length >= 8 && /[A-Za-zÀ-ỹ]/.test(value) && /\d/.test(value);

export default function RegisterForm({ setActiveForm }) {
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    xac_nhan_mat_khau: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mat_khau !== formData.xac_nhan_mat_khau) {
      showToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    if (!isValidPassword(formData.mat_khau)) {
      showToast(PASSWORD_MESSAGE, "error");
      return;
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
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h1 className="mb-1 text-2xl font-bold text-[#0a192f]">
          Tạo tài khoản mới
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Bắt đầu hành trình mới cùng chúng tôi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-regular fa-user mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="text"
            name="ho_ten"
            value={formData.ho_ten}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>

        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-regular fa-envelope mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>

        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-solid fa-phone mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="tel"
            name="so_dien_thoai"
            value={formData.so_dien_thoai}
            onChange={handleChange}
            placeholder="Số điện thoại"
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
            minLength={8}
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>
        <p className="-mt-3 text-xs text-gray-500">{PASSWORD_MESSAGE}</p>

        <div className="flex items-center border-b-2 border-gray-200 py-2 transition-colors focus-within:border-[#349DFF]">
          <i className="fa-solid fa-shield-halved mr-3 w-6 text-center text-lg text-gray-500"></i>
          <input
            type="password"
            name="xac_nhan_mat_khau"
            value={formData.xac_nhan_mat_khau}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-6 w-full rounded-xl bg-[#349DFF] py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-xs font-medium text-gray-400">hoặc</span>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <div className="text-center text-sm font-medium text-[#0a192f]">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => setActiveForm("login")}
          className="ml-1 font-bold text-[#349DFF] hover:underline"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
}
