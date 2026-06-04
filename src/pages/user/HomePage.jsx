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
    <div className="text-gray-800 font-sans bg-gradient-to-b from-[#e3f0ff] to-[#f4f7fb] lg:bg-none lg:bg-[#f4f7fb] min-h-screen flex flex-col">
      <Header />

      <main className="max-w-[1200px] mx-auto mt-2 lg:mt-6 px-3 lg:px-4 flex-1 w-full">
        {/* Mobile Date */}
        <div className="flex lg:hidden justify-end items-center mb-4 px-1">
          <div className="text-blue-500 text-xs font-medium">{today}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 lg:mb-6">
          <div className="bg-white rounded-2xl lg:rounded-full flex items-center px-4 sm:px-6 py-3 sm:py-3 shadow-sm border border-gray-100 lg:border-gray-200 w-full md:flex-1">
            <i className="fa-solid fa-magnifying-glass text-gray-400 mr-3"></i>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm sân cầu lông"
              className="flex-1 outline-none text-sm text-gray-700 w-full bg-transparent"
            />
          </div>
          <div className="hidden lg:block text-gray-500 text-sm whitespace-nowrap px-2">
            {today}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mb-5 lg:mb-8 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button className="bg-white border border-gray-100 lg:border-gray-200 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <i className="fa-solid fa-sliders"></i> Lọc
          </button>
          <button className="bg-[#eef3ff] border border-blue-100 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-blue-700 whitespace-nowrap">
            <i className="fa-regular fa-calendar"></i> Ngày
          </button>
          <button className="bg-[#eef3ff] border border-blue-100 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-blue-700 whitespace-nowrap">
            <i className="fa-regular fa-clock"></i> Giờ
          </button>
          <button className="bg-[#eef3ff] border border-blue-100 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-full text-sm flex items-center gap-2 shadow-sm font-medium text-blue-700 whitespace-nowrap">
            <i className="fa-solid fa-arrow-down-up-across-line"></i> Sắp xếp
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="flex-1">
            {/* Mobile Banner */}
            <div className="block lg:hidden w-full mb-6">
              <div className="bg-gradient-to-r from-[#eef4ff] to-[#d6e5ff] rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="z-10 flex-1">
                  <div className="text-blue-700 text-[10px] font-bold flex items-center gap-1.5 mb-1 tracking-wide">
                    <i className="fa-solid fa-user-group"></i> MỜI BẠN CHƠI CÙNG
                  </div>
                  <div className="text-gray-800 text-sm font-medium mb-0.5">
                    Nhận voucher{" "}
                    <span className="text-blue-600 font-bold text-2xl align-middle ml-1">
                      50.000đ
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-3 leading-tight max-w-[160px]">
                    Khi giới thiệu bạn bè đăng ký và đặt sân lần đầu
                  </div>
                  <button className="bg-blue-600 text-white text-[10px] font-medium px-4 py-1.5 rounded-full flex items-center gap-1.5 w-max">
                    Nhận ưu đãi{" "}
                    <i className="fa-solid fa-chevron-right text-[8px]"></i>
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-40 z-0">
                  <i className="fa-solid fa-gift text-[100px] text-blue-400"></i>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-base lg:text-lg font-bold text-gray-800">
                Gợi ý cho bạn
              </h2>
              <button className="text-blue-600 text-sm hover:underline lg:hidden">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-3 lg:space-y-4">
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
                    className="bg-white rounded-2xl p-2 lg:p-4 flex flex-row gap-3 lg:gap-4 border border-gray-100 lg:border-gray-200 shadow-sm"
                  >
                    <div className="relative w-[130px] h-[130px] lg:w-[200px] lg:h-[140px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
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
                      <button className="absolute top-2 right-2 w-7 h-7 lg:w-8 lg:h-8 bg-black/30 rounded-full flex items-center justify-center text-white z-10 backdrop-blur-sm">
                        <i className="fa-regular fa-heart text-xs lg:text-sm"></i>
                      </button>
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] lg:text-xs px-2 py-0.5 lg:py-1 rounded font-medium z-10">
                        {facility.so_san || 0} sân
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-bold text-sm lg:text-base mb-1 line-clamp-1 text-gray-900">
                          {facility.ten}
                        </h3>
                        <div className="text-[10px] lg:text-sm text-gray-500 flex items-center gap-1 mb-1">
                          <i className="fa-solid fa-star text-blue-600"></i>
                          <span className="font-medium text-gray-700">4.9</span>
                          <span>(297 đánh giá)</span>
                        </div>
                        <div className="text-[10px] lg:text-sm text-gray-500 mb-1 flex items-center gap-1.5 line-clamp-1">
                          <i className="fa-solid fa-location-dot w-3 text-center"></i>
                          <span>
                            {[facility.phuong_xa, facility.tinh_thanh]
                              .filter(Boolean)
                              .join(", ") || facility.dia_chi}
                          </span>
                        </div>
                        <div className="text-[10px] lg:text-sm text-gray-500 mb-2 flex items-center gap-1.5">
                          <i className="fa-regular fa-clock w-3 text-center"></i>
                          <span>5:00 - 22:00</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <span className="bg-[#eef4ff] text-blue-600 text-[9px] lg:text-xs px-2.5 py-1 rounded font-medium inline-block">
                          Còn sân
                        </span>
                        <div className="text-right">
                          <div className="text-[9px] lg:text-xs text-gray-800 mb-0.5 font-medium">
                            Chỉ từ{" "}
                            <span className="text-blue-600 font-bold text-[11px] lg:text-sm">
                              120.000đ
                              <span className="text-gray-800 font-normal">
                                /giờ
                              </span>
                            </span>
                          </div>
                          <button className="bg-blue-600 text-white px-5 py-1.5 lg:px-6 lg:py-2 rounded-lg font-medium hover:bg-blue-700 text-[11px] lg:text-sm">
                            Đặt sân
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop Banner */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
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
