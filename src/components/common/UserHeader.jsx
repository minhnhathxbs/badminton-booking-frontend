import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../../api/axios";
import { useNotifications } from "../../contexts/notificationStore";

export default function UserHeader() {
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { soChuaDoc } = useNotifications();

  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setUser(null);
      return;
    }

    try {
      const res = await api.get("/user/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchMe, 0);
    window.addEventListener("userUpdated", fetchMe);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("userUpdated", fetchMe);
    };
  }, [fetchMe]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
    navigate("/trang-chu", {
      state: { toastMessage: "Đã đăng xuất thành công!", toastType: "success" },
    });
  };

  const navItems = [
    { to: "/trang-chu", icon: "fa-solid fa-house", label: "Trang chủ" },
    { to: "/ban-do", icon: "fa-regular fa-map", label: "Bản đồ" },
    { to: "/yeu-thich", icon: "fa-solid fa-heart", label: "Yêu thích" },
    {
      to: "/notifications",
      icon: "fa-regular fa-bell",
      label: "Thông báo",
      notification: true,
    },
  ];

  const isActive = (to) => {
    if (to === "/trang-chu") return ["/", "/trang-chu"].includes(location.pathname);
    return location.pathname === to;
  };

  const displayName = user?.ho_ten;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid min-h-24 w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:flex-nowrap sm:justify-between sm:gap-4 lg:px-8 xl:px-10">
        <Link
          to="/trang-chu"
          className="flex min-w-0 items-center gap-2 sm:min-w-[220px] sm:gap-3"
        >
          <img
            src="/logo.png"
            className="h-12 w-16 object-contain sm:h-16 sm:w-24"
            alt="Badminton Booking"
          />
          <div className="leading-tight">
            <div className="text-lg font-semibold text-blue-600 sm:text-2xl">
              Badminton
            </div>
            <div className="text-[10px] font-medium text-gray-500 sm:text-xs">Booking</div>
          </div>
        </Link>

        <nav className="col-span-2 row-start-2 mx-auto grid h-16 w-full grid-cols-4 px-0 sm:order-none sm:row-auto sm:h-20 sm:w-[560px] sm:max-w-[560px]">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold sm:text-xs ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-xl sm:h-11 sm:w-11 sm:text-2xl ${
                    active ? "bg-blue-100 text-blue-600" : "text-gray-400"
                  } relative`}
                >
                  <i className={item.icon}></i>
                  {item.notification && user && soChuaDoc > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white sm:h-[18px] sm:min-w-[18px] sm:text-[10px]">
                      {soChuaDoc > 99 ? "99+" : soChuaDoc}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative hidden min-w-[220px] justify-end sm:flex">
          {user ? (
            <ProfileButton
              user={user}
              displayName={displayName}
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              handleLogout={handleLogout}
            />
          ) : (
            <AuthButtons />
          )}
        </div>

        <div className="relative justify-self-end sm:hidden">
          {user ? (
            <ProfileButton
              compact
              user={user}
              displayName={displayName}
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              handleLogout={handleLogout}
            />
          ) : (
            <AuthButtons compact />
          )}
        </div>
      </div>
    </header>
  );
}

function AuthButtons({ compact = false }) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
      <Link
        to="/dang-ky"
        className={`rounded-xl border border-blue-600 font-bold text-blue-600 transition hover:bg-blue-50 ${
          compact ? "px-3 py-2 text-xs" : "px-5 py-2 text-sm"
        }`}
      >
        Đăng ký
      </Link>
      <Link
        to="/dang-nhap"
        className={`rounded-xl bg-blue-600 font-bold text-white transition hover:bg-blue-700 ${
          compact ? "px-3 py-2 text-xs" : "px-5 py-2 text-sm"
        }`}
      >
        Đăng nhập
      </Link>
    </div>
  );
}

function ProfileButton({
  compact = false,
  user,
  displayName,
  isProfileOpen,
  setIsProfileOpen,
  handleLogout,
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => setIsProfileOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-gray-50 ${
          compact ? "justify-center" : "gap-3"
        }`}
        aria-label="Tài khoản"
      >
        <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-blue-50 shadow-sm">
          {user?.avatar ? (
            <img
              src={getAssetUrl(user.avatar)}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-blue-600">
              <i className="fa-solid fa-user"></i>
            </div>
          )}
        </div>
        {compact ? (
          <span className="hidden text-xs font-semibold text-slate-700 min-[420px]:inline">
            Tài khoản
          </span>
        ) : (
          <div className="min-w-0 text-left leading-tight">
            <div className="text-xs font-medium text-gray-500">Xin chào,</div>
            <div className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
              {displayName}
            </div>
          </div>
        )}
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 top-[58px] z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="font-semibold text-slate-900">{displayName}</div>
            <div className="mt-1 truncate text-sm text-gray-500">
              {user?.email || "Chưa có email"}
            </div>
          </div>
          <Link
            to="/ho-so"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
          >
            <i className="fa-regular fa-user w-4 text-center"></i>
            Thông tin cá nhân
          </Link>
          <Link
            to="/lich-su-dat-san"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50"
          >
            <i className="fa-regular fa-calendar-check w-4 text-center"></i>
            Lịch sử đặt sân
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
            Đăng xuất
          </button>
        </div>
      )}
    </>
  );
}
