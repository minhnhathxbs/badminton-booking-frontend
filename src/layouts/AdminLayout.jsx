import { useCallback, useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../api/axios";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const localUser = localStorage.getItem("user");
      if (localUser && localUser !== "undefined") {
        try {
          setUser(JSON.parse(localUser));
        } catch (e) {
          console.error("Lỗi parse localStorage", e);
        }
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/user/me");
      if (res.data) {
        const updatedUser = {
          ...res.data,
          role: res.data.vai_tro_id,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserData();
    const handleUpdate = () => fetchUserData();
    window.addEventListener("userUpdated", handleUpdate);
    return () => window.removeEventListener("userUpdated", handleUpdate);
  }, [fetchUserData]);

  const navItems = [
    { path: "/admin/tong-quan", icon: "fa-chart-simple", label: "Tổng quan" },
    {
      path: "/admin/nguoi-dung",
      icon: "fa-users",
      label: "Quản lý người dùng",
    },
    {
      path: "/admin/co-so",
      icon: "fa-building-circle-check",
      label: "Quản lý cơ sở",
    },
    {
      path: "/admin/danh-muc-san",
      icon: "fa-list",
      label: "Danh mục sân",
    },
    {
      path: "/admin/thong-ke",
      icon: "fa-chart-pie",
      label: "Thống kê hệ thống",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#f4f7fb] font-sans text-[#0a192f] overflow-hidden">
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-4 lg:p-6 flex items-center justify-between gap-3 border-b border-gray-100">
          {/* Logo và Tên */}
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-xl text-[#0a192f]">Badminton</div>
              <div className="text-xs text-gray-500 font-medium tracking-wide">
                Admin System
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="lg:hidden w-10 h-10 rounded-xl text-red-500 hover:bg-red-50"
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
              "Quản trị"}
          </h1>
          <div className="flex items-center gap-4">
            {/* Avatar và Họ Tên */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-[#0a192f]">
                  {user?.ho_ten || "Admin"}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Administrator
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img
                    src={getAssetUrl(user.avatar)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/logo.png";
                    }}
                  />
                ) : (
                  <span className="text-[#349DFF] font-bold text-lg uppercase">
                    {user?.ho_ten?.charAt(0) || "A"}
                  </span>
                )}
              </div>
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
