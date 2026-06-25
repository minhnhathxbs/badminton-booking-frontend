export default function Footer() {
  return (
    <footer className="mt-6 border-t border-gray-200 bg-white pb-6 pt-8 lg:mt-10 lg:pt-12">
      <div className="mx-auto mb-8 grid max-w-[1200px] grid-cols-1 gap-8 px-4 text-center md:grid-cols-2 md:text-left lg:mb-10 lg:grid-cols-4">
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-4 flex items-center gap-2 text-xl font-bold text-blue-600">
            <img
              src="/logo.png"
              className="w-20 object-contain lg:w-24"
              alt="Logo"
            />
            <div className="text-left leading-tight">
              <div>Badminton</div>
              <div className="text-[10px] font-normal tracking-wide text-gray-500">
                Booking
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-gray-500 lg:pr-4 lg:text-sm">
            Nền tảng đặt sân cầu lông nhanh chóng, tiện lợi và uy tín.
          </p>
        </div>

        <div className="hidden lg:block">
          <h4 className="mb-5 text-sm font-bold text-gray-800">Hỗ trợ</h4>
          <ul className="space-y-3 text-sm font-medium text-gray-500">
            <li>
              <a href="#" className="hover:text-blue-600">
                Trung tâm trợ giúp
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Hướng dẫn đặt sân
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Điều khoản sử dụng
              </a>
            </li>
          </ul>
        </div>

        <div className="border-b border-gray-100 pb-4 lg:border-none lg:pb-0">
          <h4 className="mb-3 text-left text-sm font-bold text-gray-800 md:text-center lg:mb-5 lg:text-left">
            Kết nối với chúng tôi
          </h4>
          <ul className="flex flex-row items-center justify-start gap-4 text-xs font-medium text-gray-500 md:justify-center md:items-start lg:flex-col lg:items-start lg:gap-0 lg:space-y-3 lg:text-sm">
            <li>
              <a
                href="#"
                className="flex items-center gap-2 hover:text-blue-600 lg:gap-3"
              >
                <i className="fa-brands fa-facebook w-4 text-base"></i>
                <span className="hidden lg:inline">Facebook</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-2 hover:text-blue-600 lg:gap-3"
              >
                <i className="fa-solid fa-comment-dots w-4 text-base"></i>
                <span className="hidden lg:inline">Zalo</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-2 hover:text-blue-600 lg:gap-3"
              >
                <i className="fa-brands fa-youtube w-4 text-base"></i>
                <span className="hidden lg:inline">YouTube</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-left text-sm font-bold text-gray-800 md:text-center lg:mb-5 lg:text-left">
            Liên hệ
          </h4>
          <ul className="space-y-2 text-left text-xs text-gray-500 md:text-center lg:space-y-3 lg:text-left lg:text-sm">
            <li>
              Hotline:{" "}
              <span className="block font-bold text-gray-800 sm:inline">
                1900 1234
              </span>
            </li>
            <li>
              Email:{" "}
              <span className="block font-bold text-gray-800 sm:inline">
                support@badmintonbooking.vn
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 pt-4 text-center text-[10px] font-medium text-gray-500 lg:pt-6 lg:text-xs">
        © 2026 Badminton Booking. All rights reserved.
      </div>
    </footer>
  );
}
