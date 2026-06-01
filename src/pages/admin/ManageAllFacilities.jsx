import React, { useState } from "react";

export default function ManageAllFacilities() {
  const [facilities] = useState([
    {
      id: "CS101",
      ten: "Sân Cầu Lông Alpha",
      chu_san: "Lưu Tuệ Hảo",
      dia_chi: "123 Lê Lợi, Quận 1",
      trang_thai: "Chờ duyệt",
    },
    {
      id: "CS102",
      ten: "Sân Cầu Lông Beta",
      chu_san: "Trần Minh",
      dia_chi: "456 Nguyễn Văn Linh, Quận 7",
      trang_thai: "Đã duyệt",
    },
    {
      id: "CS103",
      ten: "Sân Cầu Lông Gamma",
      chu_san: "Lê Hoàng",
      dia_chi: "789 Điện Biên Phủ, Bình Thạnh",
      trang_thai: "Từ chối",
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Chờ duyệt":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
            {status}
          </span>
        );
      case "Đã duyệt":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
            {status}
          </span>
        );
      case "Từ chối":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">Duyệt cơ sở mới</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các yêu cầu đăng ký cơ sở từ chủ sân
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white">
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã CS</th>
                <th className="px-6 py-4 whitespace-nowrap">Tên cơ sở</th>
                <th className="px-6 py-4 whitespace-nowrap">Chủ sân</th>
                <th className="px-6 py-4 whitespace-nowrap">Địa chỉ</th>
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
                  <td className="px-6 py-4 font-bold text-[#349DFF]">
                    {facility.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0a192f]">
                    {facility.ten}
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {facility.chu_san}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {facility.dia_chi}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(facility.trang_thai)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {facility.trang_thai === "Chờ duyệt" && (
                      <>
                        <button
                          className="text-green-600 hover:bg-green-50 w-8 h-8 rounded-lg transition-colors mr-1 border border-transparent hover:border-green-200"
                          title="Duyệt"
                        >
                          <i className="fa-solid fa-check text-xs"></i>
                        </button>
                        <button
                          className="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Từ chối"
                        >
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      </>
                    )}
                    {facility.trang_thai !== "Chờ duyệt" && (
                      <button className="text-gray-400 hover:text-[#349DFF] hover:bg-[#eef3ff] px-3 py-1.5 rounded-lg transition-colors text-xs font-medium">
                        Chi tiết
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
