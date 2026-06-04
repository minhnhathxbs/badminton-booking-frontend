import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-8 lg:pt-12 pb-6 mt-6 lg:mt-10">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 lg:mb-10 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-4">
            <img
              src="/logo.png"
              className="w-20 lg:w-24 object-contain"
              alt="Logo"
            />
            <div className="leading-tight text-left">
              <div>Badminton</div>
              <div className="text-[10px] text-gray-500 font-normal tracking-wide">
                Booking
              </div>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 leading-relaxed lg:pr-4">
            Nền tảng đặt sân cầu lông nhanh chóng, tiện lợi và uy tín hàng đầu
            Việt Nam.
          </p>
        </div>

        <div className="hidden lg:block">
          <h4 className="font-bold text-sm mb-5 text-gray-800">Hỗ trợ</h4>
          <ul className="text-sm text-gray-500 space-y-3 font-medium">
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

        {/* Mobile Accordion Style for Support (Optional, simplified for this layout) */}
        <div className="block lg:hidden border-b border-gray-100 pb-4">
          <h4 className="font-bold text-sm mb-3 text-gray-800 text-left">
            Hỗ trợ
          </h4>
          <ul className="text-xs text-gray-500 space-y-2 font-medium text-left">
            <li>
              <a href="#" className="hover:text-blue-600 block py-1">
                Trung tâm trợ giúp
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600 block py-1">
                Hướng dẫn đặt sân
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600 block py-1">
                Chính sách bảo mật & Điều khoản
              </a>
            </li>
          </ul>
        </div>

        <div className="border-b border-gray-100 pb-4 lg:border-none lg:pb-0">
          <h4 className="font-bold text-sm mb-3 lg:mb-5 text-gray-800 text-left md:text-center lg:text-left">
            Kết nối với chúng tôi
          </h4>
          <ul className="text-xs lg:text-sm text-gray-500 flex flex-row lg:flex-col justify-start md:justify-center lg:justify-start gap-4 lg:gap-0 lg:space-y-3 font-medium items-center md:items-start">
            <li>
              <a
                href="#"
                className="hover:text-blue-600 flex items-center gap-2 lg:gap-3"
              >
                <i className="fa-brands fa-facebook text-base w-4"></i>{" "}
                <span className="hidden lg:inline">Facebook</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-blue-600 flex items-center gap-2 lg:gap-3"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.906 13.906 0 0 1 0 19.539a9.88 9.88 0 0 0 1.154.066 9.858 9.858 0 0 0 6.112-2.106 4.929 4.929 0 0 1-4.604-3.417 4.984 4.984 0 0 0 2.223-.084A4.926 4.926 0 0 1 .937 9.155v-.062a4.912 4.912 0 0 0 2.235.616A4.928 4.928 0 0 1 1.65 3.162a13.98 13.98 0 0 0 10.15 5.144 4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724 9.828 9.828 0 0 0 2.83-.774 10.007 10.007 0 0 1-2.438 2.534z"></path>
                </svg>
                <span className="hidden lg:inline">Zalo</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-blue-600 flex items-center gap-2 lg:gap-3"
              >
                <i className="fa-brands fa-youtube text-base w-4"></i>{" "}
                <span className="hidden lg:inline">YouTube</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-3 lg:mb-5 text-gray-800 text-left md:text-center lg:text-left">
            Liên hệ
          </h4>
          <ul className="text-xs lg:text-sm text-gray-500 space-y-2 lg:space-y-3 text-left md:text-center lg:text-left">
            <li>
              Hotline:{" "}
              <span className="font-bold text-gray-800 block sm:inline">
                1900 1234
              </span>
            </li>
            <li>
              Email:{" "}
              <span className="font-bold text-gray-800 block sm:inline">
                support@badmintonbooking.vn
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-[10px] lg:text-xs text-gray-500 border-t border-gray-200 pt-4 lg:pt-6 font-medium px-4">
        © 2026 Badminton Booking. All rights reserved.
      </div>
    </footer>
  );
}
