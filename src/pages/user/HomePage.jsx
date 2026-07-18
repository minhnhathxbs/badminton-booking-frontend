import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";
import FacilityReviews from "../../components/user/FacilityReviews";
import { useNotifications } from "../../contexts/notificationStore";
import {
  loadCachedUserLocation,
  requestBrowserLocation,
} from "../../utils/userLocation";

const EARTH_RADIUS_KM = 6371;

const getFacilityPosition = (facility) => {
  const lat = Number(facility?.vi_do);
  const lng = Number(facility?.kinh_do);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  if (lat === 0 && lng === 0) return null;

  return { lat, lng };
};

const getDirectionsUrl = (position) =>
  `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;

const getDistanceKm = (from, to) => {
  if (!from || !to) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const formatDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
};

const hasAvailableCourt = (facility) =>
  Number(facility?.so_slot_trong_hom_nay || 0) > 0 ||
  Number(facility?.con_san || 0) === 1;

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

function PromoBannerCard({ banner, featured = false }) {
  const imageUrl = banner.anh_nen ? getAssetUrl(banner.anh_nen) : "";

  return (
    <Link
      to={`/dat-san/${banner.co_so_id || banner.id}`}
      className={`group relative isolate block overflow-hidden rounded-[22px] bg-slate-900 text-white shadow-[0_16px_36px_rgb(15_23_42_/_0.16)] ${
        featured ? "min-h-[260px] sm:min-h-[220px] lg:col-span-2" : "min-h-[220px] sm:min-h-[180px]"
      }`}
    >
      <div className="absolute inset-0 h-full w-full bg-slate-900">
        {banner.anh_nen ? (
          <img
            src={imageUrl}
            alt={banner.ten_co_so}
            className="h-full w-full object-cover sm:object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white">
            <i className="fa-regular fa-image text-2xl"></i>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/45 to-slate-950/85 sm:bg-gradient-to-r sm:from-slate-950/85 sm:via-slate-950/45 sm:to-blue-950/15" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/25" />
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-sm sm:text-[11px]">
            <i className="fa-solid fa-bolt"></i>
            {banner.badge || "Khuyến mãi hot"}
          </div>
          <h2
            className={`max-w-[560px] font-semibold leading-tight ${
              featured ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
            }`}
          >
            {banner.gia_tri_hien_thi || banner.ten_khuyen_mai}
          </h2>
          <p className="mt-3 line-clamp-2 max-w-[520px] text-sm font-medium text-white/85">
            {banner.ten_khuyen_mai} tại {banner.ten_co_so}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{banner.ten_co_so}</div>
            <div className="text-xs text-white/70">Ưu đãi có hạn</div>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-md transition group-hover:bg-blue-50 sm:px-4">
            {banner.nut_bam || "Đặt sân"}
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { soChuaDoc } = useNotifications();
  const [facilities, setFacilities] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [activePopup, setActivePopup] = useState(null);
  const [selectedCourtType, setSelectedCourtType] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSort, setSelectedSort] = useState("pho_bien");
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState(new Set());
  const [favoriteFacilityIds, setFavoriteFacilityIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(() =>
    loadCachedUserLocation(),
  );
  const [locationStatus, setLocationStatus] = useState(() =>
    loadCachedUserLocation() ? "cached" : "idle",
  );

  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true);
      try {
        const params = {
          tu_khoa: keyword.trim() || undefined,
          tinh_thanh: selectedProvince || undefined,
          loai_san: selectedCourtType || undefined,
          gia_tu: priceFrom || undefined,
          gia_den: priceTo || undefined,
          ngay: selectedDate || undefined,
          gio: selectedTime ? `${selectedTime}:00` : undefined,
          sap_xep:
            selectedSort && selectedSort !== "gan_ban" ? selectedSort : undefined,
        };
        const res = await api.get("/co-so", { params });
        setFacilities(res.data);
      } catch {
        setFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchFacilities, 250);
    return () => clearTimeout(timeoutId);
  }, [
    keyword,
    selectedProvince,
    selectedCourtType,
    priceFrom,
    priceTo,
    selectedDate,
    selectedTime,
    selectedSort,
  ]);

  useEffect(() => {
    const fetchAllFacilities = async () => {
      try {
        const res = await api.get("/co-so");
        setAllFacilities(res.data || []);
      } catch {
        setAllFacilities([]);
      }
    };

    fetchAllFacilities();
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get("/banner", { params: { gioi_han: 3 } });
        setBanners(res.data?.data || []);
      } catch {
        setBanners([]);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBannerIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [banners.length]);

  useEffect(() => {
    const fetchMe = async () => {
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
    };

    fetchMe();
    window.addEventListener("userUpdated", fetchMe);
    return () => window.removeEventListener("userUpdated", fetchMe);
  }, []);

  const requestCurrentLocation = async () => {
    setLocationStatus("loading");
    try {
      const location = await requestBrowserLocation();
      setUserLocation(location);
      setLocationStatus("granted");
      showToast("Đã lấy vị trí hiện tại");
    } catch (error) {
      setUserLocation(null);
      setLocationStatus("error");
      showToast(error.message || "Không thể lấy vị trí hiện tại", "error");
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!localStorage.getItem("token")) {
        setFavoriteFacilityIds(new Set());
        return;
      }

      try {
        const res = await api.get("/yeu-thich");
        const favoriteIds = (res.data?.data || [])
          .map((item) => Number(item.co_so_id || item.id))
          .filter(Boolean);
        setFavoriteFacilityIds(new Set(favoriteIds));
      } catch {
        setFavoriteFacilityIds(new Set());
      }
    };

    fetchFavorites();
  }, []);

  const provinces = useMemo(() => {
    return Array.from(
      new Set(allFacilities.map((facility) => facility.tinh_thanh).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [allFacilities]);

  const filteredFacilities = useMemo(() => {
    const withDistance = facilities.map((facility) => {
      const position = getFacilityPosition(facility);
      const distanceKm = getDistanceKm(userLocation, position);

      return {
        ...facility,
        distanceKm,
      };
    });

    if (selectedSort !== "gan_ban" || !userLocation) {
      return withDistance;
    }

    return [...withDistance].sort((a, b) => {
      const distanceA = Number.isFinite(a.distanceKm) ? a.distanceKm : Infinity;
      const distanceB = Number.isFinite(b.distanceKm) ? b.distanceKm : Infinity;

      if (distanceA !== distanceB) return distanceA - distanceB;
      return String(a.ten || "").localeCompare(String(b.ten || ""), "vi");
    });
  }, [facilities, selectedSort, userLocation]);

  const hasAdvancedFilter =
    selectedCourtType || priceFrom || priceTo || selectedDate || selectedTime;
  const hasListFilter = Boolean(
    keyword.trim() ||
      selectedProvince ||
      selectedCourtType ||
      priceFrom ||
      priceTo ||
      selectedDate ||
      selectedTime ||
      selectedSort !== "pho_bien",
  );
  const visibleFacilities =
    showAllFacilities || hasListFilter
      ? filteredFacilities
      : filteredFacilities.slice(0, 4);

  const timeOptions = Array.from({ length: 18 }, (_, index) => {
    const hour = 5 + index;
    return `${String(hour).padStart(2, "0")}:00`;
  });

  const getFacilityAddress = (facility) =>
    [facility?.dia_chi, facility?.phuong_xa, facility?.tinh_thanh]
      .filter(Boolean)
      .join(", ");

  const displayName = user?.ho_ten;
  const activeBanner = banners[activeBannerIndex] || null;

  const topNavItems = [
    { to: "/trang-chu", icon: "fa-solid fa-house", label: "Trang chủ", active: true },
    { to: "/ban-do", icon: "fa-regular fa-map", label: "Bản đồ" },
    { to: "/yeu-thich", icon: "fa-solid fa-heart", label: "Yêu thích" },
    {
      to: "/notifications",
      icon: "fa-regular fa-bell",
      label: "Thông báo",
      notification: true,
    },
  ];

  const toggleFavorite = async (facilityId) => {
    const normalizedId = Number(facilityId);
    if (!localStorage.getItem("token")) {
      showToast("Vui lòng đăng nhập để yêu thích cơ sở", "error");
      navigate("/dang-nhap");
      return;
    }

    if (favoriteLoadingIds.has(normalizedId)) return;

    const wasFavorite = favoriteFacilityIds.has(normalizedId);
    setFavoriteLoadingIds((prev) => new Set(prev).add(normalizedId));
    setFavoriteFacilityIds((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(normalizedId);
      else next.add(normalizedId);
      return next;
    });

    try {
      if (wasFavorite) {
        await api.delete(`/yeu-thich/${normalizedId}`);
        showToast("Đã bỏ yêu thích cơ sở");
      } else {
        await api.post(`/yeu-thich/${normalizedId}`);
        showToast("Đã thêm vào yêu thích");
      }
    } catch (error) {
      setFavoriteFacilityIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(normalizedId);
        else next.delete(normalizedId);
        return next;
      });
      showToast(error.response?.data?.message || "Không thể cập nhật yêu thích", "error");
    } finally {
      setFavoriteLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsProfileOpen(false);
    navigate("/trang-chu", {
      state: { toastMessage: "Đã đăng xuất thành công!", toastType: "success" },
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] font-sans text-gray-800">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
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
            {topNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold sm:text-xs ${
                  item.active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-xl sm:h-11 sm:w-11 sm:text-2xl ${
                    item.active ? "bg-blue-100 text-blue-600" : "text-gray-400"
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
            ))}
          </nav>

          <div className="relative hidden min-w-[220px] justify-end sm:flex">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-gray-50"
                >
                  <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-blue-50 shadow-sm">
                    {user.avatar ? (
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
                  <div className="min-w-0 text-left leading-tight">
                    <div className="text-xs font-medium text-gray-500">Xin chào,</div>
                    <div className="max-w-[160px] truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </div>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-[64px] z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-5 py-4">
                      <div className="font-semibold text-slate-900">{displayName}</div>
                      <div className="mt-1 truncate text-sm text-gray-500">
                        {user.email || "Chưa có email"}
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
            ) : (
              <AuthButtons />
            )}
          </div>

          <div className="relative justify-self-end sm:hidden">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-gray-50"
                  aria-label="Tài khoản"
                >
                  <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-blue-50 text-blue-600 shadow-sm">
                    {user.avatar ? (
                      <img
                        src={getAssetUrl(user.avatar)}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <i className="fa-solid fa-user"></i>
                      </div>
                    )}
                  </div>
                  <span className="hidden text-xs font-semibold text-slate-700 min-[420px]:inline">
                    Tài khoản
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-[58px] z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-5 py-4">
                      <div className="font-semibold text-slate-900">{displayName}</div>
                      <div className="mt-1 truncate text-sm text-gray-500">
                        {user.email || "Chưa có email"}
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
            ) : (
              <AuthButtons compact />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-7 lg:px-8 xl:px-10">

        <div className="mb-5 flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-h-[56px] flex-1 items-center rounded-[22px] border border-gray-200 bg-white px-5 shadow-[0_10px_24px_rgb(37_99_235_/_0.08)] lg:rounded-full">
              <i className="fa-solid fa-magnifying-glass mr-3 text-lg text-gray-400"></i>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm sân cầu lông"
                className="w-full flex-1 bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setActivePopup(activePopup === "province" ? null : "province")
              }
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] bg-white px-5 text-sm font-semibold text-slate-900 shadow-[0_8px_18px_rgb(37_99_235_/_0.07)] hover:bg-blue-50"
            >
              <i className="fa-solid fa-location-dot text-blue-600"></i>
              {selectedProvince || "Tất cả tỉnh / thành"}
              <i className="fa-solid fa-chevron-down text-xs text-slate-500"></i>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex max-w-full flex-nowrap gap-3 overflow-x-auto pb-1">
              {[
                { key: "filter", icon: "fa-sliders", label: "Lọc" },
                { key: "date", icon: "fa-calendar-days", label: "Ngày" },
                { key: "time", icon: "fa-clock", label: "Giờ" },
                { key: "sort", icon: "fa-arrow-down-wide-short", label: "Sắp xếp" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setActivePopup(activePopup === item.key ? null : item.key)
                  }
                  className="flex flex-shrink-0 items-center gap-2 rounded-[18px] border border-white bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-[0_8px_18px_rgb(37_99_235_/_0.07)] hover:bg-gray-50"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f6ff] text-blue-600">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </span>
                  {item.label}
                  {((item.key === "filter" && hasAdvancedFilter) ||
                    (item.key === "date" && selectedDate) ||
                    (item.key === "time" && selectedTime) ||
                    (item.key === "sort" && selectedSort !== "pho_bien")) && (
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={requestCurrentLocation}
                disabled={locationStatus === "loading"}
                className={`flex flex-shrink-0 items-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-semibold shadow-[0_8px_18px_rgb(37_99_235_/_0.07)] ${
                  userLocation
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                } ${locationStatus === "loading" ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <i className="fa-solid fa-location-crosshairs"></i>
                {locationStatus === "loading"
                  ? "Đang lấy vị trí"
                  : userLocation
                    ? "Đã có vị trí"
                    : "Vị trí của tôi"}
              </button>
            </div>
          </div>
        </div>

        {activeBanner && (
          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between px-1">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Khuyến mãi nổi bật
                </div>
                <h1 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">
                  Ưu đãi sân cầu lông hôm nay
                </h1>
              </div>
            </div>

            <div className="relative">
              <div className="grid overflow-hidden rounded-[22px]">
                {banners.map((banner, index) => (
                  <div
                    key={`${banner.co_so_id}-${banner.khuyen_mai_id}`}
                    className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
                      index === activeBannerIndex
                        ? "pointer-events-auto translate-x-0 opacity-100"
                        : "pointer-events-none translate-x-6 opacity-0"
                    }`}
                  >
                    <PromoBannerCard banner={banner} featured />
                  </div>
                ))}
              </div>

              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveBannerIndex(
                        (prev) => (prev - 1 + banners.length) % banners.length,
                      )
                    }
                    className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-white hover:text-blue-600 sm:grid"
                    aria-label="Banner trước"
                  >
                    <i className="fa-solid fa-chevron-left text-sm"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveBannerIndex((prev) => (prev + 1) % banners.length)
                    }
                    className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-white hover:text-blue-600 sm:grid"
                    aria-label="Banner sau"
                  >
                    <i className="fa-solid fa-chevron-right text-sm"></i>
                  </button>

                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {banners.map((banner, index) => (
                      <button
                        key={`banner-dot-${banner.co_so_id}-${banner.khuyen_mai_id}`}
                        type="button"
                        onClick={() => setActiveBannerIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeBannerIndex
                            ? "w-8 bg-white"
                            : "w-2.5 bg-white/55 hover:bg-white/80"
                        }`}
                        aria-label={`Chọn banner ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <div className="mb-10 flex flex-col gap-6 xl:flex-row">
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="text-base font-semibold text-gray-800 lg:text-lg">
                Gợi ý cho bạn
              </h2>
              {filteredFacilities.length > 4 && !hasListFilter ? (
                <button
                  type="button"
                  onClick={() => setShowAllFacilities((prev) => !prev)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  {showAllFacilities ? "Thu gọn" : "Xem tất cả"}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {filteredFacilities.length} kết quả
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {isLoading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm md:col-span-2">
                  Đang tải danh sách cơ sở...
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm md:col-span-2">
                  Không có cơ sở phù hợp với bộ lọc
                </div>
              ) : (
                visibleFacilities.map((facility) => {
                  const facilityPosition = getFacilityPosition(facility);
                  const facilityHasAvailableCourt = hasAvailableCourt(facility);

                  return (
                  <article
                    key={facility.id}
                    className="flex h-full flex-row items-start gap-3 rounded-[18px] border border-white bg-white p-3 shadow-[0_10px_24px_rgb(15_23_42_/_0.08)] sm:p-4"
                  >
                    <div className="relative h-[142px] w-[142px] flex-shrink-0 overflow-hidden rounded-[16px] bg-gray-100 max-[430px]:h-[124px] max-[430px]:w-[124px] md:h-[154px] md:w-[210px] xl:w-[220px]">
                      <button
                        type="button"
                        onClick={() => setSelectedFacility(facility)}
                        className="block h-full w-full text-left"
                      >
                      {facility.anh_chinh ? (
                        <img
                          src={getAssetUrl(facility.anh_chinh)}
                          alt={facility.ten}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-gray-400">
                          <i className="fa-regular fa-image text-2xl"></i>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="rounded-lg bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                          {facility.so_san || 0} sân
                        </span>
                      </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(facility.id)}
                        disabled={favoriteLoadingIds.has(Number(facility.id))}
                        className={`absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg text-gray-500 shadow-sm transition hover:bg-white hover:text-rose-500 lg:h-8 lg:w-8 lg:text-base ${favoriteLoadingIds.has(Number(facility.id)) ? "cursor-not-allowed opacity-60" : ""}`}
                        aria-label="Yêu thích"
                      >
                        <i
                          className={`${favoriteFacilityIds.has(Number(facility.id)) ? "fa-solid text-rose-500" : "fa-regular"} fa-heart`}
                        ></i>
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="min-w-0">
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <Link
                            to={`/dat-san/${facility.id}`}
                            className="line-clamp-2 text-lg font-semibold leading-tight text-gray-950 hover:text-blue-600 max-[430px]:text-base lg:line-clamp-1 lg:text-base"
                          >
                            {facility.ten}
                          </Link>
                          {facilityPosition && (
                            <a
                              href={getDirectionsUrl(facilityPosition)}
                              target="_blank"
                              rel="noreferrer"
                              title="Chỉ đường"
                              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 shadow-sm transition hover:bg-blue-100"
                              aria-label="Chỉ đường"
                            >
                              <i className="fa-solid fa-route text-xs"></i>
                            </a>
                          )}
                        </div>
                        <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 lg:text-sm">
                          <i className="fa-solid fa-star text-blue-600"></i>
                          <span>Chưa tải đánh giá</span>
                        </div>
                        <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500 line-clamp-1 lg:text-sm">
                          <i className="fa-solid fa-location-dot w-3 text-center"></i>
                          <span>
                            {[facility.phuong_xa, facility.tinh_thanh]
                              .filter(Boolean)
                              .join(", ") || facility.dia_chi}
                          </span>
                        </div>
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-blue-600 lg:text-sm">
                          <i className="fa-solid fa-route w-3 text-center"></i>
                          <span>
                            {Number.isFinite(facility.distanceKm)
                              ? `Cách bạn ${formatDistance(facility.distanceKm)}`
                              : userLocation
                                ? "Chưa có tọa độ để tính khoảng cách"
                            : "Bật vị trí để xem khoảng cách"}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 lg:text-sm">
                          <i className="fa-regular fa-clock w-3 text-center"></i>
                          <span>05:00 - 23:00</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                              facilityHasAvailableCourt
                                ? "bg-blue-50 text-blue-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <i
                              className={`fa-solid ${
                                facilityHasAvailableCourt
                                  ? "fa-circle-check"
                                  : "fa-circle-xmark"
                              } text-[10px]`}
                            ></i>
                            <span>{facilityHasAvailableCourt ? "Còn sân" : "Hết sân"}</span>
                          </div>
                          <Link
                            to={`/dat-san/${facility.id}`}
                            className="inline-flex flex-shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                          >
                            Đặt Sân
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </main>

      {selectedFacility && (
        <div className="fixed inset-0 z-[100] bg-slate-900/45 backdrop-blur-[2px]">
          <aside className="flex h-full w-full max-w-[460px] flex-col overflow-hidden bg-white shadow-2xl">
            <div className="relative h-52 flex-shrink-0 bg-gray-100">
              {selectedFacility.anh_chinh ? (
                <img
                  src={getAssetUrl(selectedFacility.anh_chinh)}
                  alt={selectedFacility.ten}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <i className="fa-regular fa-image text-4xl"></i>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-gray-100"
                aria-label="Đóng"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(selectedFacility.id)}
                disabled={favoriteLoadingIds.has(Number(selectedFacility.id))}
                className={`absolute right-32 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition hover:bg-gray-100 hover:text-rose-500 ${favoriteLoadingIds.has(Number(selectedFacility.id)) ? "cursor-not-allowed opacity-60" : ""}`}
                aria-label="Yêu thích"
              >
                <i
                  className={`${favoriteFacilityIds.has(Number(selectedFacility.id)) ? "fa-solid text-rose-500" : "fa-regular"} fa-heart`}
                ></i>
              </button>

              <Link
                to={`/dat-san/${selectedFacility.id}`}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
              >
                Đặt sân
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
              <section className="border-b border-gray-100 p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0a192f]">
                      {selectedFacility.ten}
                    </h2>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      <i className="fa-solid fa-medal"></i>
                      {selectedFacility.so_san || 0} sân
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                    <div className="text-lg font-semibold text-emerald-600">
                      <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="text-[10px] font-semibold uppercase text-emerald-700">
                      đánh giá
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex gap-3">
                    <i className="fa-solid fa-location-dot mt-0.5 w-4 text-blue-600"></i>
                    <span>{getFacilityAddress(selectedFacility) || "Chưa cập nhật địa chỉ"}</span>
                  </p>
                  <p className="flex gap-3">
                    <i className="fa-solid fa-route mt-0.5 w-4 text-blue-600"></i>
                    <span>
                      {Number.isFinite(selectedFacility.distanceKm)
                        ? `Cách bạn ${formatDistance(selectedFacility.distanceKm)}`
                        : userLocation
                          ? "Cơ sở chưa có tọa độ để tính khoảng cách"
                          : "Bật vị trí để xem khoảng cách"}
                    </span>
                  </p>
                  <p className="flex gap-3">
                    <i className="fa-regular fa-clock mt-0.5 w-4 text-blue-600"></i>
                    <span>05:00 - 23:00</span>
                  </p>
                  <p className="flex gap-3">
                    <i className="fa-solid fa-circle-check mt-0.5 w-4 text-blue-600"></i>
                    <span>Đang hoạt động</span>
                  </p>
                </div>
              </section>

              <section className="border-b border-gray-100 p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-900">
                  Thông tin cơ sở
                </h3>
                <p className="text-sm leading-6 text-gray-600">
                  {selectedFacility.mo_ta ||
                    "Cơ sở cầu lông có không gian thoáng, phù hợp đặt sân theo giờ cho cá nhân và nhóm bạn."}
                </p>
              </section>

              <FacilityReviews facility={selectedFacility} />
            </div>
          </aside>
        </div>
      )}

      {activePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-[#0a192f]">
                {activePopup === "province" && "Chọn tỉnh / thành"}
                {activePopup === "filter" && "Bộ lọc"}
                {activePopup === "date" && "Chọn ngày"}
                {activePopup === "time" && "Chọn giờ"}
                {activePopup === "sort" && "Sắp xếp"}
              </h3>
              <button
                type="button"
                onClick={() => setActivePopup(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 p-5">
              {activePopup === "province" && (
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedProvince(""); setActivePopup(null); }}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${!selectedProvince ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
                  >
                    Tất cả tỉnh / thành
                  </button>
                  {provinces.map((province) => (
                    <button
                      key={province}
                      type="button"
                      onClick={() => { setSelectedProvince(province); setActivePopup(null); }}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${selectedProvince === province ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
                    >
                      {province}
                    </button>
                  ))}
                </div>
              )}

              {activePopup === "filter" && (
                <>
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase text-gray-500">Loại sân</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "", label: "Tất cả" },
                        { value: "thuong", label: "Sân thường" },
                        { value: "vip", label: "Sân VIP" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSelectedCourtType(item.value)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${selectedCourtType === item.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-gray-500">Giá từ</span>
                      <input value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} type="number" min="0" placeholder="0" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-gray-500">Giá đến</span>
                      <input value={priceTo} onChange={(e) => setPriceTo(e.target.value)} type="number" min="0" placeholder="200000" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                    </label>
                  </div>
                </>
              )}

              {activePopup === "date" && (
                <input value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} type="date" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-blue-500" />
              )}

              {activePopup === "time" && (
                <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto">
                  <button type="button" onClick={() => setSelectedTime("")} className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${!selectedTime ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>Tất cả</button>
                  {timeOptions.map((time) => (
                    <button key={time} type="button" onClick={() => setSelectedTime(time)} className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${selectedTime === time ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>{time}</button>
                  ))}
                </div>
              )}

              {activePopup === "sort" && (
                <>
                  <div className="grid gap-2">
                    {[
                      { value: "pho_bien", label: "Phổ biến nhất" },
                      { value: "gan_ban", label: "Gần bạn nhất" },
                      { value: "gia_thap", label: "Giá thấp đến cao" },
                      { value: "gia_cao", label: "Giá cao đến thấp" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          if (item.value === "gan_ban" && !userLocation) {
                            requestCurrentLocation();
                          }
                          setSelectedSort(item.value);
                          setActivePopup(null);
                        }}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${selectedSort === item.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {!userLocation && (
                    <button
                      type="button"
                      onClick={requestCurrentLocation}
                      disabled={locationStatus === "loading"}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {locationStatus === "loading"
                        ? "Đang lấy vị trí..."
                        : "Lấy vị trí hiện tại"}
                    </button>
                  )}
                </>
              )}
            </div>

            {activePopup !== "province" && activePopup !== "sort" && (
              <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
                <button type="button" onClick={() => { if (activePopup === "filter") { setSelectedCourtType(""); setPriceFrom(""); setPriceTo(""); } if (activePopup === "date") setSelectedDate(""); if (activePopup === "time") setSelectedTime(""); }} className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200">Xóa lọc</button>
                <button type="button" onClick={() => setActivePopup(null)} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Áp dụng</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


