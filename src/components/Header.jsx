import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api, { getAssetUrl } from "../api/axios";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: "/trang-chu", icon: "fa-solid fa-house", label: "Trang chủ" },
    { to: "/map", icon: "fa-solid fa-location-dot", label: "Bản đồ" },
    { to: "/favorites", icon: "fa-regular fa-heart", label: "Yêu thích" },
    { to: "/notifications", icon: "fa-regular fa-bell", label: "Thông báo" },
  ];

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await api.get("/user/me");
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  };

  useEffect(() => {
    fetchMe();
    window.addEventListener("userUpdated", fetchMe);
    return () => window.removeEventListener("userUpdated", fetchMe);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsProfileOpen(false);
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
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 relative z-50">
      <div className="flex items-center justify-between">
        <Link
          to="/trang-chu"
          className="flex items-center gap-1 text-blue-600 font-bold text-xl"
        >
          <div className="w-28 flex-shrink-0">
            <img src="/logo.png" className="w-full object-contain" />
          </div>
          <div className="leading-tight">
            <div>Badminton</div>
            <div className="text-[10px] text-gray-500 font-normal tracking-wide">
              Booking
            </div>
          </div>
        </Link>

        {/* Nav links */}
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

        {/* User Section */}
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
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/ho-so"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#eef3ff]"
                  >
                    <i className="fa-regular fa-user w-4"></i> Thông tin cá nhân
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
    </header>
  );
}
