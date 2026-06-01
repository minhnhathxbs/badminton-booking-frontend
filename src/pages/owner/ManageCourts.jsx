import React, { useState } from "react";

export default function ManageCourts() {
  const [selectedFacility, setSelectedFacility] = useState("all");

  const [courts, setCourts] = useState([
    {
      id: 1,
      ten: "Sân 1",
      loai_san: "Tiêu chuẩn",
      gia: "100.000đ/giờ",
      trang_thai: "Hoạt động",
      hinh_anh:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=300&h=200",
    },
    {
      id: 2,
      ten: "Sân 2",
      loai_san: "Tiêu chuẩn",
      gia: "100.000đ/giờ",
      trang_thai: "Hoạt động",
      hinh_anh:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=300&h=200",
    },
    {
      id: 3,
      ten: "Sân 3",
      loai_san: "Tiêu chuẩn",
      gia: "100.000đ/giờ",
      trang_thai: "Bảo trì",
      hinh_anh:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=300&h=200",
    },
    {
      id: 4,
      ten: "Sân 4",
      loai_san: "Tiêu chuẩn",
      gia: "100.000đ/giờ",
      trang_thai: "Hoạt động",
      hinh_anh:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=300&h=200",
    },
  ]);

  const handleToggleStatus = (id) => {
    setCourts(
      courts.map((court) =>
        court.id === id
          ? {
              ...court,
              trang_thai:
                court.trang_thai === "Hoạt động" ? "Bảo trì" : "Hoạt động",
            }
          : court,
      ),
    );
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-[#0a192f]">Danh sách sân</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="all">Tất cả cơ sở</option>
            <option value="alpha">Sân Cầu Lông Alpha</option>
            <option value="beta">Sân Cầu Lông Beta</option>
          </select>
          <button className="bg-[#3b82f6] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2">
            + Thêm sân
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courts.map((court) => (
          <div
            key={court.id}
            className="bg-white rounded-xl border border-blue-200/60 shadow-sm p-3 flex gap-4 relative hover:shadow-md transition-shadow"
          >
            {/* Hình ảnh */}
            <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-100">
              <img
                src={court.hinh_anh}
                alt={court.ten}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thông tin chi tiết */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-[15px] text-[#0a192f]">
                  {court.ten}
                </h3>

                {/* Các nút thao tác */}
                <div className="flex gap-2">
                  <button className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-[#349DFF] transition-colors border border-gray-100">
                    <i className="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-100">
                    <i className="fa-solid fa-trash text-[10px]"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mt-2 text-[13px]">
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-gray-500 font-medium">Loại sân:</span>
                  <span className="font-bold text-[#0a192f]">
                    {court.loai_san}
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-gray-500 font-medium">Giá:</span>
                  <span className="text-gray-700">{court.gia}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center">
                  <span className="text-gray-500 font-medium">Trạng thái:</span>
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`font-bold ${court.trang_thai === "Hoạt động" ? "text-green-600" : "text-red-500"}`}
                    >
                      {court.trang_thai}
                    </span>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={court.trang_thai === "Hoạt động"}
                        onChange={() => handleToggleStatus(court.id)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22c55e]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
