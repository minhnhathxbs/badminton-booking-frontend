import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import api, { getAssetUrl } from "../../api/axios";

export default function HomePage() {
  const [facilities, setFacilities] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/co-so");
        setFacilities(res.data);
      } catch (error) {
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return facilities;

    return facilities.filter((facility) => {
      const text = [
        facility.ten,
        facility.dia_chi,
        facility.phuong_xa,
        facility.tinh_thanh,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedKeyword);
    });
  }, [facilities, keyword]);

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="text-gray-800 font-sans bg-[#f4f7fb] min-h-screen flex flex-col">
      <Header />

      <main className="max-w-[1200px] mx-auto mt-6 px-4 flex-1 w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="bg-white rounded-full flex items-center px-6 py-3 shadow-sm border border-gray-200 w-full md:flex-1">
            <i className="fa-solid fa-magnifying-glass text-gray-400 mr-3"></i>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm sân cầu lông"
              className="flex-1 outline-none text-sm text-gray-700 w-full"
            />
          </div>
          <div className="text-gray-500 text-sm whitespace-nowrap md:px-2">
            {today}
          </div>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button className="bg-white border border-gray-200 px-5 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <i className="fa-solid fa-sliders"></i> Lọc
          </button>
          <button className="bg-white border border-gray-200 px-5 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <i className="fa-regular fa-calendar"></i> Ngày
          </button>
          <button className="bg-white border border-gray-200 px-5 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <i className="fa-regular fa-clock"></i> Giờ
          </button>
          <button className="bg-white border border-gray-200 px-5 py-2.5 rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <i className="fa-solid fa-arrow-down-up-across-line"></i> Sắp xếp
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Gợi ý cho bạn</h2>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center text-gray-500">
                  Đang tải danh sách cơ sở...
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center text-gray-500">
                  Chưa có cơ sở nào được duyệt
                </div>
              ) : (
                filteredFacilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 border border-gray-200 shadow-sm"
                  >
                    <div className="relative w-full sm:w-[200px] h-[160px] sm:h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {facility.anh_chinh ? (
                        <img
                          src={getAssetUrl(facility.anh_chinh)}
                          alt={facility.ten}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fa-regular fa-image text-2xl"></i>
                        </div>
                      )}
                      <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-400 z-10">
                        <i className="fa-solid fa-heart"></i>
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium z-10">
                        {facility.so_san || 0} sân
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-bold text-base mb-1">
                          {facility.ten}
                        </h3>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                          <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                          <span className="font-bold text-black">Mới</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                          <i className="fa-solid fa-location-dot w-3 text-center"></i>
                          {facility.dia_chi}
                        </div>
                        <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                          <i className="fa-solid fa-map-location-dot w-3 text-center"></i>
                          {[facility.phuong_xa, facility.tinh_thanh]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium inline-block mb-3 sm:mb-0">
                          Đang hoạt động
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end py-1 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-1 mt-2 sm:mt-0">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-gray-500 mb-0.5">
                          Cọc trước
                        </div>
                        <div className="text-blue-600 font-bold text-lg">
                          {Number(facility.phan_tram_coc || 0)}%
                        </div>
                      </div>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
                        Đặt sân
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-[#eef3ff] rounded-2xl p-6 text-center border border-[#dce6fa] shadow-sm relative overflow-hidden">
              <div className="text-blue-600 font-bold text-xs mb-6 flex items-center justify-center gap-2 tracking-wide uppercase">
                <i className="fa-solid fa-user-group"></i> Mời bạn chơi cùng
              </div>
              <div className="font-bold text-[15px] mb-2">Nhận voucher</div>
              <div className="text-5xl font-bold text-blue-600 mb-3">
                50.000
                <span className="text-2xl underline align-top ml-1">đ</span>
              </div>
              <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                Khi giới thiệu bạn bè
                <br />
                đăng ký và đặt sân lần đầu
              </p>

              <button className="w-full bg-[#0d6efd] text-white py-3 rounded-xl font-medium hover:bg-blue-700 flex justify-center items-center gap-2 text-sm shadow-md">
                Nhận ưu đãi
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
