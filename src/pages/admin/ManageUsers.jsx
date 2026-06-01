import React, { useState } from "react";

export default function ManageUsers() {
  const [users] = useState([
    {
      id: 1,
      ho_ten: "Quách Minh Nhật",
      email: "nhat@example.com",
      vai_tro: "Người chơi",
      trang_thai: "Hoạt động",
    },
    {
      id: 2,
      ho_ten: "Lưu Tuệ Hảo",
      email: "hao@example.com",
      vai_tro: "Chủ sân",
      trang_thai: "Hoạt động",
    },
    {
      id: 3,
      ho_ten: "Nguyễn Văn A",
      email: "vana@example.com",
      vai_tro: "Người chơi",
      trang_thai: "Bị khóa",
    },
  ]);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Quản lý người dùng
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tài khoản người chơi và chủ sân trên hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white">
            <option value="all">Tất cả vai trò</option>
            <option value="player">Người chơi</option>
            <option value="owner">Chủ sân</option>
          </select>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Tìm email, tên..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Người dùng</th>
                <th className="px-6 py-4 whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-gray-500">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#0a192f]">
                      {user.ho_ten}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${
                        user.vai_tro === "Chủ sân"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {user.vai_tro}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${
                        user.trang_thai === "Hoạt động"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {user.trang_thai === "Hoạt động" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                      )}
                      {user.trang_thai}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.trang_thai === "Hoạt động" ? (
                      <button className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200 text-xs font-medium">
                        Khóa
                      </button>
                    ) : (
                      <button className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-green-200 text-xs font-medium">
                        Mở khóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
