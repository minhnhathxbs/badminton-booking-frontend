import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const HOURS = Array.from({ length: 15 }, (_, index) => 8 + index);

const formatHour = (hour) => `${String(hour).padStart(2, "0")}:00`;
const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const getSlotPrice = (hour) => (hour >= 17 ? 120000 : 80000);
const getPriceRange = (row) => {
  if (Number(row.gia_thap_nhat) === Number(row.gia_cao_nhat)) {
    return formatCurrency(row.gia_thap_nhat);
  }
  return `${formatCurrency(row.gia_thap_nhat)} - ${formatCurrency(row.gia_cao_nhat)}`;
};

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isVipCourt = (court) => {
  const categoryName = String(court.ten_danh_muc || "").toLowerCase();
  return categoryName.includes("vip");
};

const CalendarIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const isMockBooked = (courtIndex, hour) => {
  const patterns = [
    [18, 19, 20],
    [16, 17],
    [19, 20],
    [13, 14, 15],
    [10, 11],
    [21],
  ];
  return patterns[courtIndex % patterns.length]?.includes(hour);
};

export default function FacilityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [courts, setCourts] = useState([]);
  const [priceSummary, setPriceSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [bookingStep, setBookingStep] = useState("select");
  const [showQrPayment, setShowQrPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("deposit");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError("");
      setSelectedSlots(new Set());
      setBookingStep("select");
      setShowQrPayment(false);

      try {
        const [facilityRes, courtRes, priceRes] = await Promise.all([
          api.get(`/co-so/${id}`),
          api.get("/san", { params: { co_so_id: id } }),
          api.get("/bang-gia/cong-khai", { params: { co_so_id: id } }),
        ]);

        setFacility(facilityRes.data);
        setCourts(courtRes.data || []);
        setPriceSummary(priceRes.data?.bang_gia || []);
      } catch (err) {
        setFacility(null);
        setCourts([]);
        setPriceSummary([]);
        setError(
          err.response?.data?.message || "Không thể tải thông tin cơ sở",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const selectedItems = useMemo(() => {
    return Array.from(selectedSlots)
      .map((slotKey) => {
        const [courtId, hour] = slotKey.split("-").map(Number);
        const court = courts.find((item) => Number(item.id) === courtId);

        return {
          key: slotKey,
          courtName: court?.ten || "",
          hour,
          price: getSlotPrice(hour),
        };
      })
      .filter((item) => item.courtName)
      .sort(
        (a, b) =>
          a.courtName.localeCompare(b.courtName, "vi") || a.hour - b.hour,
      );
  }, [courts, selectedSlots]);

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const depositRate = Number(facility?.phan_tram_coc ?? 30);
  const deposit = Math.round((totalPrice * depositRate) / 100);
  const paymentAmount = paymentType === "full" ? totalPrice : deposit;
  const remainingAmount = totalPrice - paymentAmount;
  const totalHours = selectedItems.length;
  const address = [facility?.dia_chi, facility?.phuong_xa, facility?.tinh_thanh]
    .filter(Boolean)
    .join(", ");
  const courtSections = useMemo(
    () => [
      {
        title: "Sân thường",
        courts: courts.filter((court) => !isVipCourt(court)),
      },
      {
        title: "Sân VIP",
        courts: courts.filter(isVipCourt),
      },
    ],
    [courts],
  );

  const isClosedSlot = (hour) => hour < 9;

  const toggleSlot = (court, hour, courtIndex) => {
    if (isClosedSlot(hour) || isMockBooked(courtIndex, hour)) return;

    const slotKey = `${court.id}-${hour}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotKey)) {
        next.delete(slotKey);
      } else {
        next.add(slotKey);
      }
      return next;
    });
  };

  const getSlotClass = (court, hour, courtIndex) => {
    const slotKey = `${court.id}-${hour}`;

    if (isClosedSlot(hour)) {
      return "bg-[#ff0000] cursor-not-allowed";
    }

    if (isMockBooked(courtIndex, hour)) {
      return "bg-[#b9b9b9] cursor-not-allowed";
    }

    if (selectedSlots.has(slotKey)) {
      return "bg-[#2f57e8] border-[#2447c6] shadow-[inset_0_0_0_2px_#2447c6] hover:bg-[#2f57e8]";
    }

    return "bg-white hover:bg-blue-50 cursor-pointer";
  };

  const goToConfirm = () => {
    if (selectedItems.length === 0) return;
    setBookingStep("confirm");
    setShowQrPayment(false);
    setPaymentType("deposit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-600"></i>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 p-4 font-sans text-slate-800">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl text-rose-500">
            <i className="fa-regular fa-circle-xmark"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Không tìm thấy cơ sở
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link
            to="/trang-chu"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (bookingStep === "confirm") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 font-sans text-slate-800 pb-24">
        {/* Header xác nhận */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setBookingStep("select");
                setShowQrPayment(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              Xác nhận đặt sân
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        <main className="mx-auto max-w-3xl p-4 space-y-6 mt-4">
          {/* Thông tin cơ sở */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i className="fa-solid fa-location-dot text-indigo-600"></i>
              Thông tin cơ sở
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-slate-500">Tên CLB</span>
                <span className="font-bold text-slate-900">{facility.ten}</span>
              </p>
              <p className="flex justify-between text-right">
                <span className="text-slate-500">Địa chỉ</span>
                <span className="font-medium text-slate-800 max-w-[60%] leading-relaxed">
                  {address || "Chưa cập nhật"}
                </span>
              </p>
            </div>
          </section>

          {/* Chi tiết lịch đặt */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              Chi tiết lịch đặt
            </h2>

            <div className="mb-4 text-sm font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Ngày đặt:{" "}
              <span className="font-bold text-indigo-700">
                {new Date(selectedDate).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              {selectedItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    <span className="font-semibold text-slate-800">
                      {item.courtName}
                    </span>
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-xs font-medium">
                      {formatHour(item.hour)} - {formatHour(item.hour + 1)}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Tổng thời gian</span>
                <span className="font-semibold text-slate-800">
                  {totalHours} giờ
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tổng tiền sân</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </section>

          {/* Form thông tin người đặt */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i className="fa-regular fa-user text-indigo-600"></i>
              Thông tin liên hệ
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Tên người đặt
                </label>
                <input
                  type="text"
                  defaultValue="Quách Minh Nhật"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Số điện thoại
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <span className="mr-3 font-semibold text-slate-400">
                    VN (+84)
                  </span>
                  <input
                    type="tel"
                    defaultValue="0987654321"
                    className="w-full bg-transparent outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Ghi chú cho chủ sân
                </label>
                <textarea
                  placeholder="Yêu cầu thêm..."
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Phương thức thanh toán */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i className="fa-solid fa-wallet text-indigo-600"></i>
              Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
              <label
                className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                  paymentType === "deposit"
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setPaymentType("deposit");
                  setShowQrPayment(false);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    Thanh toán cọc ({depositRate}%)
                  </span>
                  <div
                    className={`h-4 w-4 rounded-full border-[5px] ${paymentType === "deposit" ? "border-indigo-600 bg-white" : "border-slate-200 bg-transparent"}`}
                  ></div>
                </div>
                <span className="text-lg font-bold text-indigo-700">
                  {formatCurrency(deposit)}
                </span>
              </label>

              <label
                className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                  paymentType === "full"
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setPaymentType("full");
                  setShowQrPayment(false);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    Thanh toán toàn bộ
                  </span>
                  <div
                    className={`h-4 w-4 rounded-full border-[5px] ${paymentType === "full" ? "border-indigo-600 bg-white" : "border-slate-200 bg-transparent"}`}
                  ></div>
                </div>
                <span className="text-lg font-bold text-indigo-700">
                  {formatCurrency(totalPrice)}
                </span>
              </label>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm">
              <div className="flex justify-between font-semibold text-slate-700 mb-2">
                <span>Số tiền cần thanh toán ngay</span>
                <span className="text-indigo-700 text-base">
                  {formatCurrency(paymentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Số tiền còn lại thu tại sân</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Mock QR Code */}
          {showQrPayment && (
            <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 text-center">
              <h2 className="text-base font-bold text-indigo-900">
                Quét mã QR để thanh toán
              </h2>
              <div className="mx-auto mt-5 grid h-48 w-48 grid-cols-6 grid-rows-6 gap-1 rounded-xl bg-white p-3 shadow-sm border border-slate-200">
                {Array.from({ length: 36 }, (_, index) => (
                  <div
                    key={index}
                    className={`rounded-sm ${
                      [0, 1, 2, 6, 12, 30, 31, 35, 20, 21, 27, 28].includes(
                        index,
                      )
                        ? "bg-indigo-900"
                        : index % 3 === 0
                          ? "bg-indigo-600"
                          : "bg-indigo-100"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="mt-5 space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  Nội dung chuyển khoản:{" "}
                  <span className="font-bold text-indigo-700 select-all">
                    DAT SAN {facility.id}
                  </span>
                </p>
                <p className="text-sm font-medium text-slate-700">
                  Số tiền:{" "}
                  <span className="font-bold text-rose-600">
                    {formatCurrency(paymentAmount)}
                  </span>
                </p>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                <i className="fa-solid fa-circle-info mr-1"></i> QR hiển thị mục
                đích mô phỏng cổng thanh toán.
              </p>
            </section>
          )}
        </main>

        {/* Thanh Xác nhận cố định */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={() => setShowQrPayment(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-200"
            >
              <i className="fa-solid fa-qrcode"></i>
              {paymentType === "full"
                ? "Thanh toán toàn bộ"
                : "Thanh toán tiền cọc"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TRANG CHỌN LỊCH SÂN ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <main className="w-full px-3 pb-36 pt-4 lg:px-8 lg:pb-40 lg:pt-8">
        {/* Header Chọn sân */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                aria-label="Quay lại"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {facility.ten}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <i className="fa-solid fa-location-dot"></i>
                {address || "Chưa có địa chỉ"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setShowPriceModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300"
              >
                <i className="fa-solid fa-tags"></i>
                Bảng giá
              </button>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Khung đặt sân */}
        <div className="space-y-5">
          {/* Chú giải trạng thái */}
          <div className="rounded-xl border border-[#9a9a9a] bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 border border-[#9a9a9a] bg-white"></span>{" "}
                Trống
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#2447c6] bg-[#2f57e8]"></span>{" "}
                Đang chọn
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#8f8f8f] bg-[#b9b9b9]"></span>{" "}
                Đã đặt
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#d40000] bg-[#ff0000]"></span>{" "}
                Khóa
              </span>
            </div>
          </div>

          {courtSections.map((section) => (
            <section
              key={section.title}
              className="overflow-hidden rounded-xl border border-[#9a9a9a] bg-white shadow-sm"
            >
              <div className="border-b border-[#9a9a9a] bg-[#f8fafc] px-4 py-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  {section.title}
                </h2>
              </div>

              {section.courts.length === 0 ? (
                <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-500">
                  <i className="fa-regular fa-folder-open text-3xl mb-3 text-slate-300"></i>
                  <p className="text-sm font-medium">
                    Chưa có dữ liệu {section.title.toLowerCase()}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <div
                    className="grid min-w-[1000px]"
                    style={{
                      gridTemplateColumns: `120px repeat(${HOURS.length}, minmax(56px, 1fr))`,
                    }}
                  >
                    <div className="sticky left-0 z-20 flex items-center border-b border-r border-[#9a9a9a] bg-[#d8f5e4] px-2 py-2 text-xs font-semibold text-emerald-900">
                      Sân
                    </div>
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-r border-[#9a9a9a] bg-white px-1 py-2 text-center text-xs font-semibold text-slate-700"
                      >
                        {formatHour(hour)}
                      </div>
                    ))}

                    {section.courts.map((court) => {
                      const courtIndex = courts.findIndex(
                        (item) => Number(item.id) === Number(court.id),
                      );

                      return (
                        <React.Fragment key={court.id}>
                          <div className="sticky left-0 z-10 flex min-h-[44px] flex-col justify-center border-b border-r border-[#9a9a9a] bg-[#d8f5e4] px-2 py-1">
                            <div
                              className="truncate text-xs font-semibold text-emerald-900"
                              title={court.ten}
                            >
                              {court.ten}
                            </div>
                          </div>

                          {HOURS.map((hour) => (
                            <button
                              key={`${court.id}-${hour}`}
                              type="button"
                              onClick={() => toggleSlot(court, hour, courtIndex)}
                              className={`h-full min-h-[44px] border-b border-r border-[#9a9a9a] text-xs transition-colors ${getSlotClass(court, hour, courtIndex)}`}
                              title={`${court.ten} | ${formatHour(hour)} - ${formatHour(hour + 1)}`}
                            ></button>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          ))}

          <div className="hidden">
            {courts.length === 0 ? (
              <div className="m-4 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-500">
                <i className="fa-regular fa-folder-open text-3xl mb-3 text-slate-300"></i>
                <p className="text-sm font-medium">
                  Cơ sở này hiện chưa có dữ liệu sân.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <div
                  className="grid min-w-[1000px]"
                  style={{
                    gridTemplateColumns: `120px repeat(${HOURS.length}, minmax(56px, 1fr))`,
                  }}
                >
                  {/* Header Row */}
                  <div className="sticky left-0 z-20 flex items-center border-b border-r border-[#9a9a9a] bg-[#d8f5e4] px-2 py-2 text-xs font-semibold text-emerald-900">
                    Sân
                  </div>
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-r border-[#9a9a9a] bg-white px-1 py-2 text-center text-xs font-semibold text-slate-700"
                    >
                      {formatHour(hour)}
                    </div>
                  ))}

                  {/* Body Rows */}
                  {courts.map((court, courtIndex) => (
                    <React.Fragment key={court.id}>
                      <div className="sticky left-0 z-10 flex min-h-[44px] flex-col justify-center border-b border-r border-[#9a9a9a] bg-[#d8f5e4] px-2 py-1">
                        <div
                          className="truncate text-xs font-semibold text-emerald-900"
                          title={court.ten}
                        >
                          {court.ten}
                        </div>
                      </div>

                      {HOURS.map((hour) => (
                        <button
                          key={`${court.id}-${hour}`}
                          type="button"
                          onClick={() => toggleSlot(court, hour, courtIndex)}
                          className={`h-full min-h-[44px] border-b border-r border-[#9a9a9a] text-xs transition-colors ${getSlotClass(court, hour, courtIndex)}`}
                          title={`${court.ten} | ${formatHour(hour)} - ${formatHour(hour + 1)}`}
                        ></button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/80 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Đã chọn
            </p>
            <p className="text-sm font-bold text-slate-900">
              {totalHours} khung giờ
            </p>
          </div>
          <div className="flex-1 sm:text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng tạm tính
            </p>
            <p className="text-lg font-black text-blue-600">
              {formatCurrency(totalPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={goToConfirm}
            disabled={selectedItems.length === 0}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            Tiếp tục <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* Modal Bảng giá */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Bảng giá dịch vụ
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Tham khảo mức giá theo loại ngày và khung giờ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 overflow-x-auto max-h-[70vh] custom-scrollbar">
              <table className="w-full min-w-[500px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700">
                      Loại ngày
                    </th>
                    <th className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700">
                      Khung giờ
                    </th>
                    <th className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-right text-slate-700">
                      Mức giá
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priceSummary.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-10 text-center text-slate-500 font-medium"
                      >
                        Cơ sở này hiện chưa thiết lập bảng giá.
                      </td>
                    </tr>
                  ) : (
                    priceSummary.map((row, index) => (
                      <tr
                        key={`${row.loai_ngay_id}-${row.loai_gio_id}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {index > 0 &&
                          priceSummary[index - 1].ten_loai_ngay ===
                            row.ten_loai_ngay
                            ? ""
                            : row.ten_loai_ngay}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.ten_loai_gio}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-700 text-right">
                          {getPriceRange(row)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hỗ trợ scrollbar đẹp cho table */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}
