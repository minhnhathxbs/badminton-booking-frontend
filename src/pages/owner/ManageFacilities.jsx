import React, { useState } from "react";

export default function ManageFacilities() {
  const [facilities] = useState([
    {
      id: 1,
      ten: "Sân Cầu Lông Alpha",
      dia_chi: "123 Lê Lợi, Quận 1, TP.HCM",
      so_san: 4,
      trang_thai: "Hoạt động",
    },
    {
      id: 2,
      ten: "Sân Cầu Lông Beta",
      dia_chi: "456 Nguyễn Văn Linh, Quận 7, TP.HCM",
      so_san: 6,
      trang_thai: "Bảo trì",
    },
  ]);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">Cơ sở của tôi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh sách các sân cầu lông bạn đang sở hữu
          </p>
        </div>
        <button className="bg-[#349DFF] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Thêm cơ sở
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã CS</th>
                <th className="px-6 py-4 whitespace-nowrap">Tên cơ sở</th>
                <th className="px-6 py-4 whitespace-nowrap">Địa chỉ</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">
                  Số lượng sân
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facilities.map((facility) => (
                <tr
                  key={facility.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-gray-500">
                    #{facility.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0a192f]">
                    {facility.ten}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {facility.dia_chi}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-gray-700">
                    {facility.so_san}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${
                        facility.trang_thai === "Hoạt động"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}
                    >
                      {facility.trang_thai === "Hoạt động" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
                      )}
                      {facility.trang_thai}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-gray-400 hover:text-[#349DFF] hover:bg-[#eef3ff] w-8 h-8 rounded-lg transition-colors mr-1"
                      title="Chỉnh sửa"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
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
