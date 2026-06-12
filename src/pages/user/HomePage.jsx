import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import api, { getAssetUrl } from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

export default function HomePage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
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
          sap_xep: selectedSort || undefined,
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
    return facilities;
  }, [facilities]);

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
      : filteredFacilities.slice(0, 3);

  const timeOptions = Array.from({ length: 18 }, (_, index) => {
    const hour = 5 + index;
    return `${String(hour).padStart(2, "0")}:00`;
  });

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const getFacilityAddress = (facility) =>
    [facility?.dia_chi, facility?.phuong_xa, facility?.tinh_thanh]
      .filter(Boolean)
      .join(", ");

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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 font-sans text-gray-800">
      <Header />

      <main className="mx-auto mt-2 w-full max-w-[1600px] flex-1 px-4 lg:mt-6 lg:px-8 xl:px-10">
        <div className="mb-4 flex items-center justify-end px-1 lg:hidden">
          <div className="text-xs font-medium text-blue-500">{today}</div>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-h-[52px] flex-1 items-center rounded-2xl border border-gray-200 bg-white px-4 shadow-sm lg:rounded-full">
              <i className="fa-solid fa-magnifying-glass mr-3 text-gray-400"></i>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm sân cầu lông"
                className="w-full flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setActivePopup(activePopup === "province" ? null : "province")
              }
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#eef4ff] px-4 text-sm font-bold text-slate-900 shadow-sm hover:bg-blue-100"
            >
              <i className="fa-solid fa-location-dot text-blue-600"></i>
              {selectedProvince || "Tỉnh / thành"}
              <i className="fa-solid fa-chevron-down text-xs text-slate-500"></i>
            </button>
            <div className="hidden whitespace-nowrap px-2 text-sm text-gray-500 lg:block">
              {today}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
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
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.label}
                  {((item.key === "filter" && hasAdvancedFilter) ||
                    (item.key === "date" && selectedDate) ||
                    (item.key === "time" && selectedTime) ||
                    (item.key === "sort" && selectedSort !== "pho_bien")) && (
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  )}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[#eef3ff] px-4 py-2.5 text-sm font-bold text-blue-700">
              {filteredFacilities.length} cơ sở
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-col gap-6 xl:flex-row">
          <div className="flex-1">
            <div className="mb-6 block w-full lg:hidden">
              <div className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#eef4ff] to-[#d6e5ff] p-4 shadow-sm">
                <div className="z-10 flex-1">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-blue-700">
                    <i className="fa-solid fa-user-group"></i>
                    Mời bạn chơi cùng
                  </div>
                  <div className="mb-0.5 text-sm font-medium text-gray-800">
                    Nhận voucher{" "}
                    <span className="ml-1 align-middle text-2xl font-bold text-blue-600">
                      50.000đ
                    </span>
                  </div>
                  <div className="mb-3 max-w-[160px] text-[10px] leading-tight text-gray-500">
                    Khi giới thiệu bạn bè đăng ký và đặt sân lần đầu
                  </div>
                  <button
                    type="button"
                    className="flex w-max items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-medium text-white"
                  >
                    Nhận ưu đãi
                    <i className="fa-solid fa-chevron-right text-[8px]"></i>
                  </button>
                </div>
                <div className="absolute -bottom-4 -right-4 z-0 h-32 w-32 opacity-40">
                  <i className="fa-solid fa-gift text-[100px] text-blue-400"></i>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-gray-800 lg:text-lg">
                Gợi ý cho bạn
              </h2>
              {filteredFacilities.length > 3 && !hasListFilter ? (
                <button
                  type="button"
                  onClick={() => setShowAllFacilities((prev) => !prev)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  {showAllFacilities ? "Thu gọn" : "Xem tất cả"}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-500 lg:hidden">
                  {filteredFacilities.length} kết quả
                </span>
              )}
            </div>

            <div className="space-y-3 lg:space-y-4">
              {isLoading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                  Đang tải danh sách cơ sở...
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                  Không có cơ sở phù hợp với bộ lọc
                </div>
              ) : (
                visibleFacilities.map((facility) => (
                  <article
                    key={facility.id}
                    className="flex flex-row gap-3 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm lg:gap-4 lg:border-gray-200 lg:p-4"
                  >
                    <div className="relative h-[130px] w-[130px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 lg:h-[140px] lg:w-[200px]">
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
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <i className="fa-regular fa-image text-2xl"></i>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white lg:py-1 lg:text-xs">
                        {facility.so_san || 0} sân
                      </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(facility.id)}
                        disabled={favoriteLoadingIds.has(Number(facility.id))}
                        className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-sm transition hover:bg-white hover:text-rose-500 ${favoriteLoadingIds.has(Number(facility.id)) ? "cursor-not-allowed opacity-60" : ""}`}
                        aria-label="Yêu thích"
                      >
                        <i
                          className={`${favoriteFacilityIds.has(Number(facility.id)) ? "fa-solid text-rose-500" : "fa-regular"} fa-heart`}
                        ></i>
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <Link
                          to={`/dat-san/${facility.id}`}
                          className="mb-1 line-clamp-1 text-sm font-bold text-gray-900 hover:text-blue-600 lg:text-base"
                        >
                          {facility.ten}
                        </Link>
                        <div className="mb-1 flex items-center gap-1 text-[10px] text-gray-500 lg:text-sm">
                          <i className="fa-solid fa-star text-blue-600"></i>
                          <span className="font-medium text-gray-700">4.9</span>
                          <span>(đánh giá)</span>
                        </div>
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-gray-500 line-clamp-1 lg:text-sm">
                          <i className="fa-solid fa-location-dot w-3 text-center"></i>
                          <span>
                            {[facility.phuong_xa, facility.tinh_thanh]
                              .filter(Boolean)
                              .join(", ") || facility.dia_chi}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] text-gray-500 lg:text-sm">
                          <i className="fa-regular fa-clock w-3 text-center"></i>
                          <span>05:00 - 23:00</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <span className="inline-block rounded bg-[#eef4ff] px-2.5 py-1 text-[9px] font-medium text-blue-600 lg:text-xs">
                          Đang hoạt động
                        </span>
                        <div className="text-right">
                          <div className="mb-0.5 text-[9px] font-medium text-gray-800 lg:text-xs">
                            {facility.gia_thap_nhat ? (
                              <>
                                Giá từ{" "}
                                <span className="text-[11px] font-bold text-blue-600 lg:text-sm">
                                  {Number(facility.gia_thap_nhat).toLocaleString("vi-VN")}đ
                                  <span className="font-normal text-gray-800">
                                    /giờ
                                  </span>
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-gray-500">Chưa có giá</span>
                            )}
                          </div>
                          <Link
                            to={`/dat-san/${facility.id}`}
                            className="inline-flex rounded-lg bg-blue-600 px-5 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 lg:px-6 lg:py-2 lg:text-sm"
                          >
                            Đặt sân
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="hidden w-full max-w-[360px] flex-shrink-0 xl:block">
            <div className="relative overflow-hidden rounded-2xl border border-[#dce6fa] bg-[#eef3ff] p-6 text-center shadow-sm">
              <div className="mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-600">
                <i className="fa-solid fa-user-group"></i>
                Mời bạn chơi cùng
              </div>
              <div className="mb-2 text-[15px] font-bold">Nhận voucher</div>
              <div className="mb-3 text-5xl font-bold text-blue-600">
                50.000
                <span className="align-top text-2xl underline ml-1">đ</span>
              </div>
              <p className="mb-8 text-xs leading-relaxed text-gray-500">
                Khi giới thiệu bạn bè
                <br />
                đăng ký và đặt sân lần đầu
              </p>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d6efd] py-3 text-sm font-medium text-white shadow-md hover:bg-blue-700"
              >
                Nhận ưu đãi
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
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
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                Đặt sân
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
              <section className="border-b border-gray-100 p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0a192f]">
                      {selectedFacility.ten}
                    </h2>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      <i className="fa-solid fa-medal"></i>
                      {selectedFacility.so_san || 0} sân
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                    <div className="text-lg font-black text-emerald-600">
                      4.9
                    </div>
                    <div className="text-[10px] font-bold uppercase text-emerald-700">
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
                <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-gray-900">
                  Thông tin cơ sở
                </h3>
                <p className="text-sm leading-6 text-gray-600">
                  {selectedFacility.mo_ta ||
                    "Cơ sở cầu lông có không gian thoáng, phù hợp đặt sân theo giờ cho cá nhân và nhóm bạn."}
                </p>
              </section>

              <section className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-gray-900">
                    Đánh giá
                  </h3>
                  <button
                    type="button"
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    Viết đánh giá
                  </button>
                </div>

                <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-3xl font-black text-gray-900">4.9</span>
                    <div>
                      <div className="text-sm text-yellow-500">
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        Dựa trên đánh giá của khách đã đặt sân
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "Nguyễn Minh",
                      content: "Sân sạch, ánh sáng tốt, nhân viên hỗ trợ nhanh.",
                    },
                    {
                      name: "Hoàng Anh",
                      content: "Đặt sân thuận tiện, vị trí dễ tìm.",
                    },
                  ].map((review) => (
                    <div
                      key={review.name}
                      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-bold text-gray-900">{review.name}</div>
                        <div className="text-xs text-yellow-500">
                          <i className="fa-solid fa-star"></i> 5.0
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-gray-600">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
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
                <div className="grid gap-2">
                  {[
                    { value: "pho_bien", label: "Phổ biến nhất" },
                    { value: "gan_ban", label: "Gần bạn nhất" },
                    { value: "gia_thap", label: "Giá thấp đến cao" },
                    { value: "gia_cao", label: "Giá cao đến thấp" },
                  ].map((item) => (
                    <button key={item.value} type="button" onClick={() => { setSelectedSort(item.value); setActivePopup(null); }} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${selectedSort === item.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}>{item.label}</button>
                  ))}
                </div>
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

      <Footer />
    </div>
  );
}


