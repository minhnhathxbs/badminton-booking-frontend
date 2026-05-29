import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
        <div className="w-10 h-10 rounded-full bg-[#eef3ff] flex items-center justify-center text-blue-600">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8.5 2.5a15.3 15.3 0 0 1 0 19"></path>
            <path d="M15.5 2.5a15.3 15.3 0 0 0 0 19"></path>
          </svg>
        </div>
        <div className="leading-tight">
          <div>Badminton</div>
          <div className="text-[10px] text-gray-500 font-normal tracking-wide">
            Booking
          </div>
        </div>
      </div>

      <nav className="flex gap-4 text-gray-500 font-medium text-sm items-center">
        <Link
          to="/"
          className="flex flex-col items-center text-blue-600 px-4 py-2 hover:bg-gray-50 rounded-xl"
        >
          <i className="fa-solid fa-house mb-1"></i> Trang chủ
        </Link>
        <Link
          to="/map"
          className="flex flex-col items-center hover:bg-gray-50 px-4 py-2 rounded-xl"
        >
          <i className="fa-solid fa-location-dot mb-1"></i> Bản đồ
        </Link>
        <Link
          to="/favorites"
          className="flex flex-col items-center bg-[#eef3ff] text-gray-800 px-6 py-2 rounded-xl"
        >
          <i className="fa-regular fa-heart mb-1"></i> Yêu thích
        </Link>
        <Link
          to="/notifications"
          className="flex flex-col items-center hover:bg-gray-50 px-4 py-2 rounded-xl"
        >
          <i className="fa-regular fa-bell mb-1"></i> Thông báo
        </Link>
      </nav>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eef3ff] text-blue-600 flex items-center justify-center font-bold text-sm">
            NA
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs text-gray-500">Xin chào,</div>
            <div className="font-bold text-sm text-gray-800">
              Nguyễn Văn A 👋
              <i className="fa-solid fa-chevron-down text-[10px] ml-1 text-gray-400"></i>
            </div>
          </div>
        </div>
        <div className="border-gray-200">
          <div className="flex items-center gap-2 font-medium bg-[#eef3ff] px-4 py-2 rounded-lg text-gray-800 text-sm">
            <i className="fa-solid fa-location-dot text-blue-600"></i> TP. Hồ
            Chí Minh
            <i className="fa-solid fa-chevron-down text-gray-400 text-[10px] ml-1"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
