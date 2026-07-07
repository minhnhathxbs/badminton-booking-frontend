import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import UserHeader from "../../components/common/UserHeader";

const PASSWORD_MESSAGE =
  "Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ và 1 số";

const isValidPassword = (value) =>
  value.length >= 8 && /[A-Za-zÀ-ỹ]/.test(value) && /\d/.test(value);

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    mat_khau_cu: "",
    mat_khau_moi: "",
    xac_nhan_mat_khau_moi: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordData.mat_khau_moi !== passwordData.xac_nhan_mat_khau_moi) {
      return setError("Mật khẩu xác nhận không khớp");
    }

    if (!isValidPassword(passwordData.mat_khau_moi)) {
      return setError(PASSWORD_MESSAGE);
    }

    setLoading(true);
    try {
      await api.put("/user/change-password", passwordData);

      navigate("/ho-so", {
        state: {
          toastMessage: "Đổi mật khẩu thành công!",
          toastType: "success",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] font-sans text-slate-800">
      <UserHeader />

      <main className="mx-auto mb-12 mt-8 w-full max-w-[600px] px-4">
        <h1 className="mb-6 text-2xl font-semibold text-[#0a192f]">
          Đổi mật khẩu
        </h1>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-8 md:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 py-2 text-center text-sm font-medium text-red-500">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative text-gray-400 focus-within:text-[#349DFF]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <i className="fa-solid fa-lock text-sm"></i>
                  </div>
                  <input
                    type="password"
                    name="mat_khau_cu"
                    value={passwordData.mat_khau_cu}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-all focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative text-gray-400 focus-within:text-[#349DFF]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <i className="fa-solid fa-key text-sm"></i>
                  </div>
                  <input
                    type="password"
                    name="mat_khau_moi"
                    value={passwordData.mat_khau_moi}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới"
                    minLength={8}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-all focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF]"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">{PASSWORD_MESSAGE}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Nhập lại mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative text-gray-400 focus-within:text-[#349DFF]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <i className="fa-solid fa-shield-halved text-sm"></i>
                  </div>
                  <input
                    type="password"
                    name="xac_nhan_mat_khau_moi"
                    value={passwordData.xac_nhan_mat_khau_moi}
                    onChange={handleChange}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-all focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF]"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#349DFF] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-blue-300"
                >
                  <i className="fa-regular fa-circle-check"></i>
                  {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
