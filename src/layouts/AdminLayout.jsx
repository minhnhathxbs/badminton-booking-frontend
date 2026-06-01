import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: "/admin/nguoi-dung",
      icon: "fa-users",
      label: "Quản lý người dùng",
    },
    {
      path: "/admin/duyet-co-so",
      icon: "fa-building-circle-check",
      label: "Duyệt cơ sở",
    },
    {
      path: "/admin/thong-ke",
      icon: "fa-chart-pie",
      label: "Thống kê hệ thống",
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f4f7fb] font-sans text-[#0a192f] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#eef3ff] flex items-center justify-center text-[#349DFF]">
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-lg text-[#0a192f]">Admin</div>
            <div className="text-[11px] text-gray-500 font-medium tracking-wide">
              System Control
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center"></i>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-0">
          <h1 className="text-xl font-bold text-[#0a192f]">
            {navItems.find((i) => location.pathname.includes(i.path))?.label ||
              "Quản trị viên"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#349DFF] hover:bg-[#eef3ff] transition-colors relative">
              <i className="fa-regular fa-bell"></i>
            </button>
            <div className="w-10 h-10 rounded-full bg-[#eef3ff] text-[#349DFF] flex items-center justify-center font-bold border border-blue-100">
              AD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
