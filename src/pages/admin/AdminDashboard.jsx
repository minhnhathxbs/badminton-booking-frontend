import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Thống kê hệ thống</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Tổng người dùng</div>
          <div className="text-3xl font-bold mt-2">1,250</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Cơ sở chờ duyệt</div>
          <div className="text-3xl font-bold mt-2 text-blue-600">12</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Tổng doanh thu hệ thống</div>
          <div className="text-3xl font-bold mt-2">500M+</div>
        </div>
      </div>
    </div>
  );
}
