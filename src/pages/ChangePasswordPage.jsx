import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ChangePasswordPage() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Khối xử lý gọi API cập nhật mật khẩu
  };

  return (
    <div className="bg-[#f4f7fb] min-h-screen text-[#0a192f] font-sans flex flex-col">
      <Header />

      <main className="max-w-[600px] mx-auto mt-10 px-4 flex-1 w-full mb-12">
        <h1 className="text-2xl font-bold mb-6 text-[#0a192f]">Đổi mật khẩu</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 md:px-10 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tài khoản Email
                </label>
                <div className="relative text-gray-400">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <input
                    type="email"
                    value="sv@caothang.edu.vn"
                    readOnly
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Mật khẩu hiện tại */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative focus-within:text-[#349DFF] text-gray-400">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-sm"></i>
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm text-gray-800 focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative focus-within:text-[#349DFF] text-gray-400">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-key text-sm"></i>
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm text-gray-800 focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Nhập lại mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative focus-within:text-[#349DFF] text-gray-400">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-shield-halved text-sm"></i>
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm text-gray-800 focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* Button Actions */}
              <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2"
                >
                  <i className="fa-regular fa-circle-check"></i> Cập nhật mật
                  khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
