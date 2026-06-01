import React, { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ManagePrices() {
  const [myFacilities, setMyFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  // Trạng thái tỷ lệ cọc (%)
  const [depositPercentage, setDepositPercentage] = useState(30);

  const [priceData, setPriceData] = useState({
    hanh_chinh_thuong: 60000,
    hanh_chinh_cuoi_tuan: 80000,
    hanh_chinh_le: 100000,
    vang_thuong: 100000,
    vang_cuoi_tuan: 120000,
    vang_le: 150000,
    khuya_thuong: 50000,
    khuya_cuoi_tuan: 60000,
    khuya_le: 80000,
  });

  useEffect(() => {
    const fetchMyFacilities = async () => {
      try {
        const mockData = [
          { id: "1", ten: "Sân Cầu Lông Alpha (Quận 1)", phan_tram_coc: 30 },
          { id: "2", ten: "Sân Cầu Lông Beta (Quận 7)", phan_tram_coc: 50 },
        ];
        setMyFacilities(mockData);
        if (mockData.length > 0) {
          setSelectedFacility(mockData[0].id);
          setDepositPercentage(mockData[0].phan_tram_coc);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách cơ sở:", error);
      }
    };
    fetchMyFacilities();
  }, []);

  const handleFacilityChange = (e) => {
    const facilityId = e.target.value;
    setSelectedFacility(facilityId);

    // Cập nhật lại tỷ lệ cọc hiển thị theo cơ sở được chọn
    const facility = myFacilities.find((f) => f.id === facilityId);
    if (facility) {
      setDepositPercentage(facility.phan_tram_coc);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setPriceData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const formatDisplayPrice = (price) => {
    return price ? Number(price).toLocaleString("vi-VN") : "";
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        co_so_id: selectedFacility,
        danh_muc_san_id: selectedCategory,
        phan_tram_coc: depositPercentage, // Gửi tỷ lệ cọc về Backend để update bảng co_so
        bang_gia: priceData, // Gửi ma trận giá để update bảng bang_gia
      };

      console.log("Dữ liệu gửi lên Backend:", payload);

      await new Promise((resolve) => setTimeout(resolve, 800));
      alert("Cập nhật cấu hình giá và tiền cọc thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Cấu hình Giá & Tiền cọc
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý giá thuê sân và chính sách đặt cọc cho từng cơ sở
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
            Khôi phục mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 flex items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-floppy-disk"></i>
            )}
            {isLoading ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </div>

      {/* Bộ lọc Cơ sở & Loại sân */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0a192f]">
              Chọn Cơ sở
            </label>
            <select
              value={selectedFacility}
              onChange={handleFacilityChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all bg-white text-sm"
            >
              {myFacilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.ten}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0a192f]">
              Chọn Loại sân
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all bg-white text-sm"
            >
              <option value="1">Sân thảm tiêu chuẩn</option>
              <option value="2">Sân VIP (Thảm thi đấu quốc tế)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chính sách tiền cọc */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-[#0a192f] mb-4">
          Chính sách tiền cọc
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700 w-48">
            Tỷ lệ đặt cọc bắt buộc:
          </label>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={depositPercentage}
              onChange={(e) => setDepositPercentage(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all bg-white text-sm w-full sm:w-48"
            >
              <option value={0}>0% (Không cần cọc)</option>
              <option value={30}>30%</option>
              <option value={50}>50%</option>
              <option value={100}>100% (Thanh toán đủ)</option>
            </select>
            <span className="text-xs text-gray-500 hidden sm:inline-block">
              <i className="fa-solid fa-circle-info mr-1"></i>
              Áp dụng cho các đơn đặt sân online tại cơ sở này.
            </span>
          </div>
        </div>
      </div>

      {/* Bảng cấu hình Giá */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-[#0a192f] mb-4">
          Bảng giá thuê sân
        </h3>
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-[#0a192f] font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-1/4">
                  Khung giờ \ Loại ngày
                </th>
                <th className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-1/4 text-center">
                  Ngày thường
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    (Thứ 2 - Thứ 6)
                  </span>
                </th>
                <th className="px-6 py-4 whitespace-nowrap border-r border-gray-200 w-1/4 text-center">
                  Cuối tuần
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    (Thứ 7, Chủ nhật)
                  </span>
                </th>
                <th className="px-6 py-4 whitespace-nowrap w-1/4 text-center">
                  Ngày Lễ
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    (Theo lịch nhà nước)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Giờ hành chính */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 border-r border-gray-100">
                  <div className="font-bold text-[#0a192f]">Giờ hành chính</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <i className="fa-regular fa-clock mr-1"></i>05:00 - 17:00
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      name="hanh_chinh_thuong"
                      value={formatDisplayPrice(priceData.hanh_chinh_thuong)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all text-sm font-bold text-[#0a192f] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      name="hanh_chinh_cuoi_tuan"
                      value={formatDisplayPrice(priceData.hanh_chinh_cuoi_tuan)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all text-sm font-bold text-[#0a192f] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="hanh_chinh_le"
                      value={formatDisplayPrice(priceData.hanh_chinh_le)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all text-sm font-bold text-[#0a192f] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
              </tr>

              {/* Giờ vàng */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 border-r border-gray-100">
                  <div className="font-bold text-[#eab308]">Giờ vàng</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <i className="fa-regular fa-clock mr-1"></i>17:00 - 22:00
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      name="vang_thuong"
                      value={formatDisplayPrice(priceData.vang_thuong)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-[#eab308] rounded-lg outline-none focus:ring-1 focus:ring-[#eab308] transition-all text-sm font-bold text-[#0a192f] bg-yellow-50/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      name="vang_cuoi_tuan"
                      value={formatDisplayPrice(priceData.vang_cuoi_tuan)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-[#eab308] rounded-lg outline-none focus:ring-1 focus:ring-[#eab308] transition-all text-sm font-bold text-[#0a192f] bg-yellow-50/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="vang_le"
                      value={formatDisplayPrice(priceData.vang_le)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-[#eab308] rounded-lg outline-none focus:ring-1 focus:ring-[#eab308] transition-all text-sm font-bold text-[#0a192f] bg-yellow-50/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
              </tr>

              {/* Giờ khuya */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 border-r border-gray-100">
                  <div className="font-bold text-[#0a192f]">Giờ khuya</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <i className="fa-regular fa-clock mr-1"></i>22:00 - 00:00
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      name="khuya_thuong"
                      value={formatDisplayPrice(priceData.khuya_thuong)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all text-sm font-bold text-[#0a192f] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 border-r border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      name="khuya_cuoi_tuan"
                      value={formatDisplayPrice(priceData.khuya_cuoi_tuan)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all text-sm font-bold text-[#0a192f] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="khuya_le"
                      value={formatDisplayPrice(priceData.khuya_le)}
                      onChange={handlePriceChange}
                      className="w-full text-center px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] transition-all text-sm font-bold text-[#0a192f] bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      đ/h
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
