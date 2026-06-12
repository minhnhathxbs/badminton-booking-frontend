import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api, { getAssetUrl } from "../../api/axios";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileExpanded, setIsMobileProfileExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: "/trang-chu", icon: "fa-solid fa-house", label: "Trang chủ" },
    { to: "/map", icon: "fa-solid fa-location-dot", label: "Bản đồ" },
    { to: "/yeu-thich", icon: "fa-regular fa-heart", label: "Yêu thích" },
    { to: "/notifications", icon: "fa-regular fa-bell", label: "Thông báo" },
  ];

  const getDashboardLink = () => {
    const role = Number(user?.vai_tro_id ?? user?.role);

    if (role === 2) {
      return {
        to: "/admin",
        icon: "fa-solid fa-gauge-high",
        label: "Quản lý hệ thống",
      };
    }

    if (role === 1) {
      return {
        to: "/chu-san",
        icon: "fa-solid fa-table-columns",
        label: "Quản lý chủ sân",
      };
    }

    return null;
  };

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await api.get("/user/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe();
    window.addEventListener("userUpdated", fetchMe);
    return () => window.removeEventListener("userUpdated", fetchMe);
  }, [fetchMe]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login", {
      state: { toastMessage: "Đã đăng xuất thành công!", toastType: "success" },
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-transparent lg:bg-white border-b-0 lg:border-b border-gray-200 px-4 md:px-8 py-4 lg:py-3 relative z-50">
      <div className="flex flex-wrap items-center justify-between">
        {/* Mobile Header Layout */}
        <div className="flex lg:hidden items-center justify-between w-full">
          <Link
            to="/trang-chu"
            className="flex items-center gap-1 text-blue-600 font-bold text-lg sm:text-xl"
          >
            <div className="w-16 sm:w-20 flex-shrink-0">
              <img
                src="/logo.png"
                className="w-full object-contain"
                alt="Logo"
              />
            </div>
            <div className="leading-tight">
              <div>Badminton</div>
              <div className="text-[10px] text-gray-500 font-normal tracking-wide">
                Booking
              </div>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-800 text-2xl p-2"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>

        {/* Desktop Header Layout */}
        <Link
          to="/trang-chu"
          className="hidden lg:flex items-center gap-1 text-blue-600 font-bold text-xl"
        >
          <div className="w-28 flex-shrink-0">
            <img src="/logo.png" className="w-full object-contain" alt="Logo" />
          </div>
          <div className="leading-tight">
            <div>Badminton</div>
            <div className="text-[10px] text-gray-500 font-normal tracking-wide">
              Booking
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-4 text-gray-500 font-medium text-sm items-center">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center px-4 py-2 rounded-xl transition-colors ${
                location.pathname === link.to
                  ? "bg-[#eef3ff] text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <i className={`${link.icon} mb-1`}></i> {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 p-1.5 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#eef3ff] text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden border border-gray-100">
                  {user.avatar ? (
                    <img
                      src={getAssetUrl(user.avatar)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.ho_ten?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs text-gray-500">Xin chào,</div>
                  <div className="font-bold text-sm text-gray-800">
                    {user.ho_ten}
                  </div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">
                      {user.ho_ten}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  {getDashboardLink() && (
                    <Link
                      to={getDashboardLink().to}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#eef3ff]"
                    >
                      <i className={`${getDashboardLink().icon} w-4`}></i>{" "}
                      {getDashboardLink().label}
                    </Link>
                  )}
                  <Link
                    to="/ho-so"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#eef3ff]"
                  >
                    <i className="fa-regular fa-user w-4"></i> Thông tin cá nhân
                  </Link>
                  <Link
                    to="/lich-su-dat-san"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#eef3ff]"
                  >
                    <i className="fa-regular fa-calendar-check w-4"></i> Lịch sử đặt sân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket w-4"></i>{" "}
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/dang-ky"
                className="px-5 py-2 rounded-xl text-sm font-bold border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
              >
                Đăng ký
              </Link>
              <Link
                to="/dang-nhap"
                className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col py-4 animate-slide-in-right overflow-y-auto">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="px-4 pb-4 pt-2 border-b border-gray-100">
              {user ? (
                <div className="flex flex-col mt-2">
                  <button
                    onClick={() =>
                      setIsMobileProfileExpanded(!isMobileProfileExpanded)
                    }
                    className="flex items-center gap-3 text-left w-full p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#eef3ff] text-blue-600 flex items-center justify-center font-bold text-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={getAssetUrl(user.avatar)}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.ho_ten?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="leading-tight flex-1 overflow-hidden pr-2">
                      <div className="font-bold text-base text-gray-900 truncate">
                        {user.ho_ten}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>
                    <i
                      className={`fa-solid fa-chevron-${isMobileProfileExpanded ? "up" : "down"} text-gray-400 text-xs`}
                    ></i>
                  </button>

                  {isMobileProfileExpanded && (
                    <div className="mt-3 flex flex-col gap-2 px-2">
                      {getDashboardLink() && (
                        <Link
                          to={getDashboardLink().to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-[#eef3ff] text-blue-700 font-medium"
                        >
                          <i
                            className={`${getDashboardLink().icon} w-4 text-center`}
                          ></i>{" "}
                          {getDashboardLink().label}
                        </Link>
                      )}
                      <Link
                        to="/ho-so"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-[#eef3ff] text-blue-700 font-medium"
                      >
                        <i className="fa-regular fa-user w-4 text-center"></i>{" "}
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/lich-su-dat-san"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-[#eef3ff] text-blue-700 font-medium"
                      >
                        <i className="fa-regular fa-calendar-check w-4 text-center"></i>{" "}
                        Lịch sử đặt sân
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm bg-red-50 text-red-600 font-medium w-full"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>{" "}
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-8">
                  <Link
                    to="/dang-nhap"
                    className="w-full bg-blue-600 text-white text-center py-2.5 rounded-xl font-medium text-sm"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="w-full border border-blue-600 text-blue-600 text-center py-2.5 rounded-xl font-medium text-sm"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            <nav className="flex flex-col p-3 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    location.pathname === link.to
                      ? "bg-[#eef3ff] text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <i className={`${link.icon} w-5 text-center`}></i>{" "}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
