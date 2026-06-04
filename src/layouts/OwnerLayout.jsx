import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

export default function OwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/chu-san/tong-quan", icon: "fa-chart-simple", label: "Tổng quan" },
    { path: "/chu-san/co-so", icon: "fa-building", label: "Quản lý cơ sở" },
    { path: "/chu-san/san", icon: "fa-layer-group", label: "Quản lý sân bãi" },
    {
      path: "/chu-san/lich-dat",
      icon: "fa-calendar-check",
      label: "Quản lý lịch đặt",
    },
    { path: "/chu-san/bang-gia", icon: "fa-tags", label: "Cấu hình bảng giá" },
    {
      path: "/chu-san/khuyen-mai",
      icon: "fa-ticket",
      label: "Quản lý khuyến mãi",
    },

    {
      path: "/chu-san/doanh-thu",
      icon: "fa-money-bill-wave",
      label: "Báo cáo doanh thu",
    },
    { path: "/chu-san/danh-gia", icon: "fa-star", label: "Quản lý đánh giá" },
  ];
  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#f4f7fb] font-sans text-[#0a192f] overflow-hidden">
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-4 lg:p-6 flex items-center justify-between gap-3 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#eef3ff] flex items-center justify-center text-[#349DFF]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8.5 2.5a15.3 15.3 0 0 1 0 19"></path>
              <path d="M15.5 2.5a15.3 15.3 0 0 0 0 19"></path>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-lg text-[#0a192f]">Owner</div>
            <div className="text-[11px] text-gray-500 font-medium tracking-wide">
              Portal Management
            </div>
          </div>
          </div>
          <button
            onClick={handleLogout}
            className="lg:hidden w-10 h-10 rounded-xl text-red-500 hover:bg-red-50"
            title="Đăng xuất"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>

        <nav className="flex lg:flex-1 gap-2 lg:block px-4 py-3 lg:py-6 lg:space-y-2 overflow-x-auto lg:overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex shrink-0 items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#349DFF] text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-[#eef3ff] hover:text-[#349DFF]"
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 flex flex-col lg:h-screen overflow-hidden">
        <header className="min-h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-4 md:px-8 py-3 shrink-0 shadow-sm z-0">
          <h1 className="text-base md:text-xl font-bold text-[#0a192f] leading-snug">
            {navItems.find((i) => location.pathname.includes(i.path))?.label ||
              "Quản lý"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#349DFF] hover:bg-[#eef3ff] transition-colors relative">
              <i className="fa-regular fa-bell"></i>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-[#eef3ff] text-[#349DFF] flex items-center justify-center font-bold border border-blue-100">
              CS
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
