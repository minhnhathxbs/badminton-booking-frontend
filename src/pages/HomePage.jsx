import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="text-gray-800 font-sans bg-[#f4f7fb] min-h-screen flex flex-col">
      <Header />

      <main className="max-w-[1200px] mx-auto mt-6 px-4 flex-1 w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="bg-white rounded-full flex items-center px-6 py-3 shadow-sm border border-gray-200 w-full md:flex-1">
            <i className="fa-solid fa-magnifying-glass text-gray-400 mr-3"></i>
            <input
              type="text"
              placeholder="Tìm sân cầu lông"
              className="flex-1 outline-none text-sm text-gray-700 w-full"
            />
          </div>
          <div className="text-gray-500 text-sm whitespace-nowrap md:px-2">
            Thứ năm, 21/05/2026
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
              <a
                href="#"
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Xem tất cả
              </a>
            </div>

            <div className="space-y-4">
              {/* ITEM 1 */}
              <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-[200px] h-[160px] sm:h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-400 z-10">
                    <i className="fa-solid fa-heart"></i>
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium z-10">
                    5 sân
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      Sân cầu lông của NA
                    </h3>
                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                      <span className="font-bold text-black">4.9</span> (237
                      đánh giá)
                    </div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot w-3 text-center"></i>{" "}
                      Bình Tân, TP. Hồ Chí Minh
                    </div>
                    <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                      <i className="fa-regular fa-clock w-3 text-center"></i>{" "}
                      5:00 - 22:00
                    </div>
                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-medium inline-block mb-3 sm:mb-0">
                      Còn sân
                    </span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end py-1 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-1 mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Chỉ từ</div>
                    <div className="text-blue-600 font-bold text-lg">
                      120.000đ
                      <span className="text-sm text-gray-500 font-normal">
                        /giờ
                      </span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
                    Đặt sân
                  </button>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-[200px] h-[160px] sm:h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-400 z-10">
                    <i className="fa-solid fa-heart"></i>
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium z-10">
                    5 sân
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      Sân cầu lông của NA
                    </h3>
                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                      <span className="font-bold text-black">4.9</span> (237
                      đánh giá)
                    </div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot w-3 text-center"></i>{" "}
                      Bình Tân, TP. Hồ Chí Minh
                    </div>
                    <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                      <i className="fa-regular fa-clock w-3 text-center"></i>{" "}
                      5:00 - 22:00
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium inline-block mb-3 sm:mb-0">
                      Sắp kín sân
                    </span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end py-1 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-1 mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Chỉ từ</div>
                    <div className="text-blue-600 font-bold text-lg">
                      120.000đ
                      <span className="text-sm text-gray-500 font-normal">
                        /giờ
                      </span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
                    Đặt sân
                  </button>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4 border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-[200px] h-[160px] sm:h-[140px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 z-10">
                    <i className="fa-solid fa-heart"></i>
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium z-10">
                    5 sân
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      Sân cầu lông của NA
                    </h3>
                    <div className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                      <span className="font-bold text-black">4.9</span> (237
                      đánh giá)
                    </div>
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot w-3 text-center"></i>{" "}
                      Bình Tân, TP. Hồ Chí Minh
                    </div>
                    <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                      <i className="fa-regular fa-clock w-3 text-center"></i>{" "}
                      5:00 - 22:00
                    </div>
                    <span className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full font-medium inline-block mb-3 sm:mb-0">
                      Hết sân
                    </span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end py-1 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-1 mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Chỉ từ</div>
                    <div className="text-blue-600 font-bold text-lg">
                      120.000đ
                      <span className="text-sm text-gray-500 font-normal">
                        /giờ
                      </span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm">
                    Đặt sân
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 mb-12">
              <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2">
                Xem tất cả sân{" "}
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-[#eef3ff] rounded-2xl p-6 text-center border border-[#dce6fa] shadow-sm relative overflow-hidden">
              <div className="text-blue-600 font-bold text-xs mb-6 flex items-center justify-center gap-2 tracking-wide uppercase">
                <i className="fa-solid fa-user-group"></i> MỜI BẠN CHƠI CÙNG
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

              <div className="flex justify-center mb-8">
                <div className="w-32 h-28 bg-[#95bcf5] rounded-xl flex items-center justify-center relative">
                  <div className="w-full h-8 bg-[#82aef0] absolute top-10"></div>
                  <div className="w-6 h-full bg-[#82aef0] absolute left-13"></div>
                  <div className="absolute text-white font-bold opacity-40 italic text-xl">
                    50.000đ
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#0d6efd] text-white py-3 rounded-xl font-medium hover:bg-blue-700 flex justify-center items-center gap-2 text-sm shadow-md">
                Nhận ưu đãi{" "}
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>

              <div className="flex justify-center gap-1.5 mt-5">
                <div className="w-4 h-1.5 bg-blue-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
