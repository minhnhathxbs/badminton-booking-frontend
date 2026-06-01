import React from "react";

export default function OwnerDashboard() {
  const stats = [
    {
      label: "Doanh thu tháng này",
      value: "12,500,000 đ",
      icon: "fa-wallet",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Lượt đặt sân mới",
      value: "48",
      icon: "fa-calendar-check",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Cơ sở đang hoạt động",
      value: "2",
      icon: "fa-building",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Khách hàng mới",
      value: "15",
      icon: "fa-users",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  const recentBookings = [
    {
      id: "BK1005",
      san: "Sân Alpha - Sân 1",
      thoi_gian: "18:00 - 19:00, Hôm nay",
      trang_thai: "Chờ duyệt",
    },
    {
      id: "BK1004",
      san: "Sân Beta - Sân 2",
      thoi_gian: "19:00 - 21:00, Hôm nay",
      trang_thai: "Đã duyệt",
    },
    {
      id: "BK1003",
      san: "Sân Alpha - Sân 3",
      thoi_gian: "20:00 - 22:00, Hôm qua",
      trang_thai: "Hoàn thành",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">
          Tổng quan hoạt động
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Số liệu thống kê trong tháng hiện tại
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}
            >
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-[#0a192f]">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#0a192f]">
              Yêu cầu đặt sân mới
            </h3>
            <button className="text-sm text-[#349DFF] font-medium hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#eef3ff] text-[#349DFF] flex items-center justify-center font-bold text-xs">
                    {booking.id.replace("BK", "")}
                  </div>
                  <div>
                    <div className="font-bold text-[#0a192f] text-sm">
                      {booking.san}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      <i className="fa-regular fa-clock mr-1"></i>
                      {booking.thoi_gian}
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg ${
                      booking.trang_thai === "Chờ duyệt"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : booking.trang_thai === "Đã duyệt"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {booking.trang_thai}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0a192f] mb-6">Lối tắt</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-[#eef3ff] hover:text-[#349DFF] hover:border-blue-200 transition-all text-left">
              <i className="fa-solid fa-plus text-lg"></i>
              <span className="font-medium text-sm">Thêm cơ sở mới</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-[#eef3ff] hover:text-[#349DFF] hover:border-blue-200 transition-all text-left">
              <i className="fa-solid fa-tags text-lg"></i>
              <span className="font-medium text-sm">Tạo mã giảm giá</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-[#eef3ff] hover:text-[#349DFF] hover:border-blue-200 transition-all text-left">
              <i className="fa-solid fa-wrench text-lg"></i>
              <span className="font-medium text-sm">Báo cáo bảo trì sân</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
