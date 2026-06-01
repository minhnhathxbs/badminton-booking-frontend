import React, { useState } from "react";

export default function ManagePromotions() {
  const [promotions] = useState([
    {
      id: 1,
      ma_code: "SUMMER2026",
      ten: "Chào hè giảm giá sốc",
      loai_giam: "Phần trăm",
      gia_tri: "10%",
      giam_toi_da: "30,000đ",
      da_dung: 45,
      tong_so: 100,
      thoi_gian: "01/06/2026 - 30/06/2026",
      trang_thai: "Đang diễn ra",
    },
    {
      id: 2,
      ma_code: "GIAMGIA50K",
      ten: "Giảm 50k cho đơn từ 200k",
      loai_giam: "Số tiền",
      gia_tri: "50,000đ",
      giam_toi_da: "-",
      da_dung: 20,
      tong_so: 50,
      thoi_gian: "15/06/2026 - 20/06/2026",
      trang_thai: "Sắp diễn ra",
    },
    {
      id: 3,
      ma_code: "KHAI_TRUONG",
      ten: "Mừng khai trương cơ sở Beta",
      loai_giam: "Phần trăm",
      gia_tri: "20%",
      giam_toi_da: "50,000đ",
      da_dung: 100,
      tong_so: 100,
      thoi_gian: "01/05/2026 - 15/05/2026",
      trang_thai: "Đã kết thúc",
    },
  ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Đang diễn ra":
        return "bg-green-50 text-green-700 border-green-200";
      case "Sắp diễn ra":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Đã kết thúc":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Quản lý khuyến mãi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tạo mã Voucher để thu hút khách hàng đặt sân
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Tìm mã Voucher..."
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all w-64"
            />
          </div>
          <button className="bg-[#349DFF] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Tạo mã mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã Code</th>
                <th className="px-6 py-4 whitespace-nowrap">Chương trình</th>
                <th className="px-6 py-4 whitespace-nowrap">Mức giảm</th>
                <th className="px-6 py-4 whitespace-nowrap">
                  Số lượng đã dùng
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Thời hạn</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-[#349DFF] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {promo.ma_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0a192f]">
                    {promo.ten}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-red-500">
                      {promo.gia_tri}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Tối đa: {promo.giam_toi_da}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                        <div
                          className="bg-[#349DFF] h-1.5 rounded-full"
                          style={{
                            width: `${(promo.da_dung / promo.tong_so) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {promo.da_dung}/{promo.tong_so}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {promo.thoi_gian}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${getStatusStyle(promo.trang_thai)}`}
                    >
                      {promo.trang_thai}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-gray-400 hover:text-[#349DFF] hover:bg-[#eef3ff] w-8 h-8 rounded-lg transition-colors mr-1"
                      title="Chỉnh sửa"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    {promo.trang_thai !== "Đã kết thúc" && (
                      <button
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors"
                        title="Kết thúc sớm"
                      >
                        <i className="fa-solid fa-power-off text-xs"></i>
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
