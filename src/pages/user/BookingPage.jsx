import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getSocket } from "../../api/socket";
import { showToast } from "../../components/common/ToastMessage";
import UserHeader from "../../components/common/UserHeader";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}\u0111`;
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

const formatDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMaxBookingDateValue = () => {
  const now = new Date();
  return formatDateInputValue(
    new Date(now.getFullYear(), now.getMonth() + 2, 0),
  );
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

export default function FacilityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [courts, setCourts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [priceSummary, setPriceSummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
  const [draftDate, setDraftDate] = useState(getTodayInputValue());
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [bookingStep, setBookingStep] = useState("select");
  const [paymentType, setPaymentType] = useState("deposit");
  const [holdInfo, setHoldInfo] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isCancelingHold, setIsCancelingHold] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactInfo, setContactInfo] = useState({
    ho_ten: "",
    so_dien_thoai: "",
  });
  const [bookingNote, setBookingNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoOptions, setPromoOptions] = useState([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const lastScheduleQueryRef = useRef({ id: null, selectedDate: null });
  const minBookingDate = getTodayInputValue();
  const maxBookingDate = getMaxBookingDateValue();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/me");
        if (!isMounted) return;

        setContactInfo({
          ho_ten: res.data?.ho_ten || "",
          so_dien_thoai: res.data?.so_dien_thoai || "",
        });
      } catch {
        // Người dùng chưa đăng nhập sẽ bị chặn khi gọi API giữ chỗ/thanh toán.
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      const lastQuery = lastScheduleQueryRef.current;
      const shouldResetPage =
        lastQuery.id !== id || lastQuery.selectedDate !== selectedDate;

      if (shouldResetPage) {
        setIsLoading(true);
        setError("");
        setSelectedSlots(new Set());
        setBookingStep("select");
        setHoldInfo(null);
        setPromoCode("");
        setPromoOptions([]);
      }

      try {
        const [facilityRes, scheduleRes, priceRes] = await Promise.all([
          api.get(`/co-so/${id}`),
          api.get("/dat-san/lich", {
            params: { co_so_id: id, ngay: selectedDate },
          }),
          api.get("/bang-gia/cong-khai", { params: { co_so_id: id } }),
        ]);

        setFacility(facilityRes.data);
        setCourts(scheduleRes.data?.san || []);
        setTimeSlots(scheduleRes.data?.khung_gio || []);
        setPriceSummary(priceRes.data?.bang_gia || []);
        lastScheduleQueryRef.current = { id, selectedDate };
      } catch (err) {
        if (shouldResetPage) {
          setFacility(null);
          setCourts([]);
          setTimeSlots([]);
          setPriceSummary([]);
          setError(
            err.response?.data?.message ||
              "Kh\u00f4ng th\u1ec3 t\u1ea3i th\u00f4ng tin c\u01a1 s\u1edf",
          );
        }
      } finally {
        if (shouldResetPage) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();
  }, [id, selectedDate, refreshKey]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const payload = { co_so_id: Number(id), ngay: selectedDate };
    const handleScheduleUpdated = (event) => {
      if (
        Number(event?.co_so_id) === Number(id) &&
        String(event?.ngay || "").slice(0, 10) === selectedDate
      ) {
        setRefreshKey((value) => value + 1);
      }
    };

    socket.emit("booking:schedule-join", payload);
    socket.on("booking:schedule-updated", handleScheduleUpdated);

    return () => {
      socket.emit("booking:schedule-leave", payload);
      socket.off("booking:schedule-updated", handleScheduleUpdated);
    };
  }, [id, selectedDate]);

  const selectedItems = useMemo(() => {
    return Array.from(selectedSlots)
      .map((slotKey) => {
        const [courtId, khungGioMauId] = slotKey.split("-").map(Number);
        const court = courts.find((item) => Number(item.id) === courtId);
        const slot = court?.slots?.find(
          (item) => Number(item.khung_gio_mau_id) === khungGioMauId,
        );

        return {
          key: slotKey,
          courtId,
          courtName: court?.ten || "",
          khungGioMauId,
          gio_bat_dau: slot?.gio_bat_dau || "",
          gio_ket_thuc: slot?.gio_ket_thuc || "",
          price: Number(slot?.gia || 0),
        };
      })
      .filter((item) => item.courtName && item.gio_bat_dau)
      .sort(
        (a, b) =>
          a.courtName.localeCompare(b.courtName, "vi") ||
          a.gio_bat_dau.localeCompare(b.gio_bat_dau),
      );
  }, [courts, selectedSlots]);

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const depositRate = Number(facility?.phan_tram_coc ?? 30);
  const selectedPromo = promoOptions.find(
    (item) => item.ma_khuyen_mai === promoCode,
  );
  const estimatedDiscount = Number(selectedPromo?.tien_giam_du_kien || 0);
  const bookingTotal = Number(holdInfo?.tong_tien ?? totalPrice);
  const discountAmount = Number(holdInfo?.tien_giam ?? estimatedDiscount);
  const payableTotal = Number(
    holdInfo?.thanh_tien ?? Math.max(totalPrice - estimatedDiscount, 0),
  );
  const deposit = Number(
    holdInfo?.tien_coc ?? Math.round((payableTotal * depositRate) / 100),
  );
  const paymentAmount = paymentType === "full" ? payableTotal : deposit;
  const remainingAmount = Math.max(payableTotal - paymentAmount, 0);
  const totalHours = selectedItems.length;
  const address = [facility?.dia_chi, facility?.phuong_xa, facility?.tinh_thanh]
    .filter(Boolean)
    .join(", ");
  const courtSections = useMemo(
    () => [
      {
        title: "S\u00e2n th\u01b0\u1eddng",
        courts: courts.filter((court) => !isVipCourt(court)),
      },
      {
        title: "S\u00e2n VIP",
        courts: courts.filter(isVipCourt),
      },
    ],
    [courts],
  );

  useEffect(() => {
    const promoBaseTotal = Number(holdInfo?.tong_tien ?? 0);
    if (!id || promoBaseTotal <= 0 || bookingStep !== "confirm") {
      const timeoutId = window.setTimeout(() => {
        setPromoOptions([]);
        if (bookingStep === "confirm") {
          setPromoCode("");
        }
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      setIsLoadingPromos(true);

      api
        .get("/khuyen-mai/cong-khai", {
          params: { co_so_id: id, tong_tien: promoBaseTotal },
        })
        .then((res) => {
          if (!isMounted) return;
          const list = res.data?.danh_sach || [];
          setPromoOptions(list);
          setPromoCode((current) =>
            current && !list.some((item) => item.ma_khuyen_mai === current)
              ? ""
              : current,
          );
        })
        .catch(() => {
          if (!isMounted) return;
          setPromoOptions([]);
          setPromoCode("");
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingPromos(false);
          }
        });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      isMounted = false;
    };
  }, [id, holdInfo?.tong_tien, bookingStep]);

  const toggleSlot = (court, slot) => {
    if (slot.trang_thai !== "trong") return;

    const slotKey = `${court.id}-${slot.khung_gio_mau_id}`;
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

  const handleDateChange = (value) => {
    if (value < minBookingDate) {
      setSelectedDate(minBookingDate);
      showToast(
        "Ch\u1ec9 \u0111\u01b0\u1ee3c xem l\u1ecbch t\u1eeb h\u00f4m nay",
        "error",
      );
      return;
    }

    if (value > maxBookingDate) {
      setSelectedDate(maxBookingDate);
      showToast(
        "Ch\u1ec9 \u0111\u01b0\u1ee3c \u0111\u1eb7t s\u00e2n \u0111\u1ebfn cu\u1ed1i th\u00e1ng sau",
        "error",
      );
      return;
    }

    setSelectedDate(value);
  };

  const openDateModal = () => {
    setDraftDate(selectedDate);
    setShowDateModal(true);
  };

  const applyDraftDate = () => {
    handleDateChange(draftDate);
    setShowDateModal(false);
  };

  const getSlotClass = (court, slot) => {
    const slotKey = `${court.id}-${slot.khung_gio_mau_id}`;

    if (slot.trang_thai === "khong_co_gia" || slot.trang_thai === "qua_gio") {
      return "bg-[#b9b9b9] cursor-not-allowed";
    }

    if (slot.trang_thai === "da_dat_qua_gio") {
      return "bg-[#ff4d4d] cursor-not-allowed";
    }

    if (slot.trang_thai === "da_dat" || slot.trang_thai === "giu_cho") {
      return "bg-[#ff0000] cursor-not-allowed";
    }

    if (selectedSlots.has(slotKey)) {
      return "bg-[#2f57e8] border-[#2447c6] shadow-[inset_0_0_0_2px_#2447c6] hover:bg-[#2f57e8]";
    }

    return "bg-white hover:bg-blue-50 cursor-pointer";
  };

  const goToConfirm = async () => {
    if (selectedItems.length === 0) return;

    setIsHolding(true);
    try {
      const res = await api.post("/dat-san/giu-cho", {
        co_so_id: Number(id),
        ngay: selectedDate,
        ghi_chu: bookingNote,
        slots: selectedItems.map((item) => ({
          san_id: item.courtId,
          khung_gio_mau_id: item.khungGioMauId,
        })),
      });

      setHoldInfo(res.data);
      setPromoCode(res.data?.khuyen_mai?.ma_khuyen_mai || "");
      setBookingStep("confirm");
      setPaymentType("deposit");
      showToast(
        res.data?.message || "Gi\u1eef ch\u1ed7 th\u00e0nh c\u00f4ng",
        "success",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Kh\u00f4ng th\u1ec3 gi\u1eef ch\u1ed7, vui l\u00f2ng th\u1eed l\u1ea1i";
      showToast(message, "error");

      if (err.response?.status === 409) {
        setSelectedSlots(new Set());
      }
    } finally {
      setIsHolding(false);
    }
  };

  const cancelHoldAndBack = async () => {
    if (!holdInfo?.dat_san_id) {
      setBookingStep("select");
      setHoldInfo(null);
      return;
    }

    setIsCancelingHold(true);
    try {
      const res = await api.patch(
        `/dat-san/${holdInfo.dat_san_id}/huy-giu-cho`,
      );
      showToast(
        res.data?.message || "\u0110\u00e3 h\u1ee7y gi\u1eef ch\u1ed7",
        "success",
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Kh\u00f4ng th\u1ec3 h\u1ee7y gi\u1eef ch\u1ed7",
        "error",
      );
    } finally {
      setIsCancelingHold(false);
      setBookingStep("select");
      setHoldInfo(null);
      setSelectedSlots(new Set());
      setRefreshKey((value) => value + 1);
    }
  };

  const applyPromoCode = async (nextCode) => {
    if (!holdInfo?.dat_san_id) return;

    setPromoCode(nextCode);
    try {
      const res = await api.patch(
        `/dat-san/${holdInfo.dat_san_id}/khuyen-mai`,
        {
          ma_khuyen_mai: nextCode || undefined,
        },
      );
      setHoldInfo((prev) => ({
        ...prev,
        ...res.data,
      }));
      showToast(res.data?.message || "Đã cập nhật mã khuyến mãi", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể áp mã khuyến mãi",
        "error",
      );
      setPromoCode(holdInfo?.khuyen_mai?.ma_khuyen_mai || "");
    }
  };

  const saveBookingNote = async ({ showSuccess = false } = {}) => {
    if (!holdInfo?.dat_san_id) return true;

    try {
      await api.patch(`/dat-san/${holdInfo.dat_san_id}/ghi-chu`, {
        ghi_chu: bookingNote,
      });
      if (showSuccess) {
        showToast("Đã lưu ghi chú", "success");
      }
      return true;
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể lưu ghi chú",
        "error",
      );
      return false;
    }
  };

  const createVnpayPayment = async () => {
    if (!holdInfo?.dat_san_id) {
      showToast(
        "Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u01a1n gi\u1eef ch\u1ed7",
        "error",
      );
      return;
    }

    setIsCreatingPayment(true);
    try {
      const isNoteSaved = await saveBookingNote();
      if (!isNoteSaved) return;

      const res = await api.post("/thanh-toan/vnpay/tao-url", {
        dat_san_id: holdInfo.dat_san_id,
        loai_thanh_toan: paymentType,
      });

      if (!res.data?.payment_url) {
        throw new Error(
          "Kh\u00f4ng nh\u1eadn \u0111\u01b0\u1ee3c URL thanh to\u00e1n",
        );
      }

      window.location.href = res.data.payment_url;
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Kh\u00f4ng th\u1ec3 t\u1ea1o thanh to\u00e1n VNPay",
        "error",
      );
    } finally {
      setIsCreatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 font-sans text-slate-800">
        <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-600"></i>
          {"\u0110ang t\u1ea3i d\u1eef li\u1ec7u..."}
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
            {"Kh\u00f4ng t\u00ecm th\u1ea5y c\u01a1 s\u1edf"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link
            to="/trang-chu"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            {"V\u1ec1 trang ch\u1ee7"}
          </Link>
        </div>
      </div>
    );
  }

  if (bookingStep === "confirm") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 font-sans text-slate-800 pb-24">
        {/* Header xac nhan */}
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <button
              type="button"
              onClick={cancelHoldAndBack}
              disabled={isCancelingHold}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              title="H\u1ee7y thanh to\u00e1n"
            >
              <i
                className={`fa-solid ${isCancelingHold ? "fa-circle-notch fa-spin" : "fa-chevron-left"}`}
              ></i>
            </button>
            <h1 className="text-lg font-bold text-slate-900">
              {"X\u00e1c nh\u1eadn \u0111\u1eb7t s\u00e2n"}
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        <main className="mx-auto max-w-3xl p-4 space-y-6 mt-4">
          {/* Thong tin co so */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i className="fa-solid fa-location-dot text-indigo-600"></i>
              {"Th\u00f4ng tin c\u01a1 s\u1edf"}
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-slate-500">{"T\u00ean CLB"}</span>
                <span className="font-bold text-slate-900">{facility.ten}</span>
              </p>
              <p className="flex justify-between text-right">
                <span className="text-slate-500">
                  {"\u0110\u1ecba ch\u1ec9"}
                </span>
                <span className="font-medium text-slate-800 max-w-[60%] leading-relaxed">
                  {address || "Ch\u01b0a c\u1eadp nh\u1eadt"}
                </span>
              </p>
            </div>
          </section>

          {/* Chi tiet lich dat */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              {"Chi ti\u1ebft l\u1ecbch \u0111\u1eb7t"}
            </h2>

            <div className="mb-4 text-sm font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {"Ng\u00e0y \u0111\u1eb7t"}:{" "}
              <span className="font-bold text-indigo-700">
                {new Date(selectedDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {holdInfo && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold">
                    {"M\u00e3 gi\u1eef ch\u1ed7"}: #{holdInfo.dat_san_id}
                  </span>
                  <span className="font-medium">
                    {"H\u1ebft h\u1ea1n sau"}:{" "}
                    {holdInfo.thoi_gian_het_han
                      ? new Date(holdInfo.thoi_gian_het_han).toLocaleString(
                          "vi-VN",
                        )
                      : "Sau 10 phút"}
                  </span>
                </div>
              </div>
            )}

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
                      {item.gio_bat_dau} - {item.gio_ket_thuc}
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
                <span>{"T\u1ed5ng th\u1eddi gian"}</span>
                <span className="font-semibold text-slate-800">
                  {totalHours} {"gi\u1edd"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{"T\u1ed5ng ti\u1ec1n s\u00e2n"}</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(bookingTotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-emerald-600">
                    <span>{"Khuyến mãi"}</span>
                    <span className="font-semibold">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>{"Thành tiền"}</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(payableTotal)}
                    </span>
                  </div>
                </>
              )}
              {holdInfo?.khuyen_mai && (
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>{"Mã đã áp dụng"}</span>
                  <span className="font-bold">
                    {holdInfo.khuyen_mai.ma_khuyen_mai}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              <i className="fa-solid fa-ticket text-indigo-600"></i>
              {"Khuyến mãi"}
            </h2>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowPromoModal(true)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {holdInfo?.khuyen_mai
                      ? holdInfo.khuyen_mai.ma_khuyen_mai
                      : "Chọn mã khuyến mãi"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {holdInfo?.khuyen_mai
                      ? holdInfo.khuyen_mai.ten
                      : "Xem các mã phù hợp với đơn giữ chỗ này"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {discountAmount > 0 && (
                    <span className="text-sm font-extrabold text-emerald-600">
                      -{formatCurrency(discountAmount)}
                    </span>
                  )}
                  <i className="fa-solid fa-chevron-right text-slate-400"></i>
                </div>
              </button>
            </div>
          </section>

          {/* Form thong tin nguoi dat */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i className="fa-regular fa-user text-indigo-600"></i>
              {"Th\u00f4ng tin li\u00ean h\u1ec7"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  {"T\u00ean ng\u01b0\u1eddi \u0111\u1eb7t"}
                </label>
                <input
                  type="text"
                  value={contactInfo.ho_ten}
                  onChange={(event) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      ho_ten: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  {"S\u1ed1 \u0111i\u1ec7n tho\u1ea1i"}
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <span className="mr-3 font-semibold text-slate-400">
                    VN (+84)
                  </span>
                  <input
                    type="tel"
                    value={contactInfo.so_dien_thoai}
                    onChange={(event) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        so_dien_thoai: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  {"Ghi chú cho chủ sân"}
                </label>
                <textarea
                  placeholder="Ghi chú cho chủ sân"
                  value={bookingNote}
                  onChange={(event) => setBookingNote(event.target.value)}
                  onBlur={() => saveBookingNote()}
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                ></textarea>
              </div>
            </div>
          </section>

          {/* Phuong thuc thanh toan */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <i className="fa-solid fa-wallet text-indigo-600"></i>
              {"Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n"}
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
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    {"Thanh to\u00e1n c\u1ecdc"} ({depositRate}%)
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
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    {"Thanh to\u00e1n to\u00e0n b\u1ed9"}
                  </span>
                  <div
                    className={`h-4 w-4 rounded-full border-[5px] ${paymentType === "full" ? "border-indigo-600 bg-white" : "border-slate-200 bg-transparent"}`}
                  ></div>
                </div>
                <span className="text-lg font-bold text-indigo-700">
                  {formatCurrency(payableTotal)}
                </span>
              </label>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm">
              <div className="flex justify-between font-semibold text-slate-700 mb-2">
                <span>{"S\u1ed1 ti\u1ec1n c\u1ea7n thanh to\u00e1n ngay"}</span>
                <span className="text-indigo-700 text-base">
                  {formatCurrency(paymentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{"S\u1ed1 ti\u1ec1n c\u00f2n l\u1ea1i"}</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </section>
        </main>

        {showPromoModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="max-h-[82vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200 sm:max-w-lg sm:rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {"Chọn mã khuyến mãi"}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {"Các mã phù hợp với đơn giữ chỗ hiện tại."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  aria-label="Dong"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="max-h-[62vh] space-y-3 overflow-y-auto p-5">
                <button
                  type="button"
                  onClick={() => {
                    applyPromoCode("");
                    setShowPromoModal(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    !promoCode
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {"Không dùng mã"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {"Giữ nguyên tổng tiền hiện tại."}
                    </p>
                  </div>
                  {!promoCode && (
                    <i className="fa-solid fa-check text-indigo-600"></i>
                  )}
                </button>

                {isLoadingPromos ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    {"Đang tải mã khuyến mãi"}
                  </div>
                ) : promoOptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                    {"Không có mã phù hợp với đơn này."}
                  </div>
                ) : (
                  promoOptions.map((promo) => {
                    const isSelected = promoCode === promo.ma_khuyen_mai;
                    return (
                      <button
                        key={promo.id}
                        type="button"
                        onClick={() => {
                          applyPromoCode(promo.ma_khuyen_mai);
                          setShowPromoModal(false);
                        }}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-slate-900">
                              {promo.ma_khuyen_mai}
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {promo.ten}
                            </p>
                            {promo.mo_ta && (
                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {promo.mo_ta}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-emerald-600">
                              -{formatCurrency(promo.tien_giam_du_kien)}
                            </p>
                            {isSelected && (
                              <p className="mt-1 text-xs font-bold text-emerald-700">
                                {"Đang áp dụng"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">
                          {Number(promo.don_toi_thieu || 0) > 0 && (
                            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                              Đơn từ {formatCurrency(promo.don_toi_thieu)}
                            </span>
                          )}
                          {Number(promo.so_luong || 0) > 0 && (
                            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                              Còn{" "}
                              {Math.max(
                                Number(promo.so_luong || 0) -
                                  Number(promo.da_su_dung || 0),
                                0,
                              )}{" "}
                              lượt
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Thanh xac nhan co dinh */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button
              type="button"
              onClick={cancelHoldAndBack}
              disabled={isCancelingHold}
              className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCancelingHold ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  {"\u0110ang h\u1ee7y"}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-xmark"></i>
                  {"H\u1ee7y thanh to\u00e1n"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={createVnpayPayment}
              disabled={isCancelingHold || isCreatingPayment}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 shadow-md shadow-indigo-200"
            >
              {isCreatingPayment ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  {"\u0110ang t\u1ea1o thanh to\u00e1n"}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-credit-card"></i>
                  {paymentType === "full"
                    ? "Thanh to\u00e1n to\u00e0n b\u1ed9"
                    : "Thanh to\u00e1n ti\u1ec1n c\u1ecdc"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TRANG CHON LICH SAN ---
  return (
    <div className="min-h-screen bg-[#f4f8ff] font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <UserHeader />
      <main className="w-full px-3 pb-36 pt-4 lg:px-8 lg:pb-40 lg:pt-8">
        {/* Header chon san */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                aria-label="Quay lai"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {facility.ten}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <i className="fa-solid fa-location-dot"></i>
                {address || "Ch\u01b0a c\u00f3 \u0111\u1ecba ch\u1ec9"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setShowPriceModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300"
              >
                <i className="fa-solid fa-tags"></i>
                {"B\u1ea3ng gi\u00e1"}
              </button>
              <button
                type="button"
                onClick={openDateModal}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <CalendarIcon className="h-4 w-4 text-indigo-600" />
                {new Date(selectedDate).toLocaleDateString("vi-VN")}
              </button>
            </div>
          </div>
        </div>

        {/* Khung dat san */}
        <div className="space-y-5">
          {/* Chu giai trang thai */}
          <div className="rounded-xl border border-[#9a9a9a] bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 border border-[#9a9a9a] bg-white"></span>{" "}
                {"Tr\u1ed1ng"}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#2447c6] bg-[#2f57e8]"></span>{" "}
                {"\u0110ang ch\u1ecdn"}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#d40000] bg-[#ff0000]"></span>{" "}
                {"\u0110\u00e3 \u0111\u1eb7t"}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#e03131] bg-[#ff4d4d]"></span>{" "}
                {"\u0110\u00e3 qua gi\u1edd"}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-4 rounded-sm border border-[#8f8f8f] bg-[#b9b9b9]"></span>{" "}
                {"Kh\u00f3a"}
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
                    {"Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u"}{" "}
                    {section.title.toLowerCase()}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <div
                    className="grid min-w-[1000px]"
                    style={{
                      gridTemplateColumns: `120px repeat(${timeSlots.length}, minmax(56px, 1fr))`,
                    }}
                  >
                    <div className="sticky left-0 z-20 flex items-center border-b border-r border-[#9a9a9a] bg-[#d8f5e4] px-2 py-2 text-xs font-semibold text-emerald-900">
                      {"S\u00e2n"}
                    </div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="border-b border-r border-[#9a9a9a] bg-white px-1 py-2 text-center text-xs font-semibold text-slate-700"
                      >
                        {slot.gio_bat_dau}
                      </div>
                    ))}

                    {section.courts.map((court) => (
                      <React.Fragment key={court.id}>
                        <div className="sticky left-0 z-10 flex min-h-[44px] flex-col justify-center border-b border-r border-[#9a9a9a] bg-[#d8f5e4] px-2 py-1">
                          <div
                            className="truncate text-xs font-semibold text-emerald-900"
                            title={court.ten}
                          >
                            {court.ten}
                          </div>
                        </div>

                        {timeSlots.map((timeSlot) => {
                          const slot = court.slots?.find(
                            (item) =>
                              Number(item.khung_gio_mau_id) ===
                              Number(timeSlot.id),
                          );

                          return (
                            <button
                              key={`${court.id}-${timeSlot.id}`}
                              type="button"
                              onClick={() => slot && toggleSlot(court, slot)}
                              className={`h-full min-h-[44px] border-b border-r border-[#9a9a9a] text-xs transition-colors ${
                                slot
                                  ? getSlotClass(court, slot)
                                  : "bg-[#b9b9b9] cursor-not-allowed"
                              }`}
                              title={`${court.ten} | ${timeSlot.gio_bat_dau} - ${timeSlot.gio_ket_thuc}${
                                slot?.gia
                                  ? ` | ${formatCurrency(slot.gia)}`
                                  : ""
                              }`}
                            ></button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/80 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {"\u0110\u00e3 ch\u1ecdn"}
            </p>
            <p className="text-sm font-bold text-slate-900">
              {totalHours} {"khung gi\u1edd"}
            </p>
          </div>
          <div className="flex-1 sm:text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {"T\u1ed5ng t\u1ea1m t\u00ednh"}
            </p>
            {estimatedDiscount > 0 && (
              <p className="text-xs font-bold text-emerald-600">
                -{formatCurrency(estimatedDiscount)}
              </p>
            )}
            <p className="text-lg font-black text-blue-600">
              {formatCurrency(payableTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={goToConfirm}
            disabled={selectedItems.length === 0 || isHolding}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            {isHolding ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                {"\u0110ang gi\u1eef ch\u1ed7"}
              </>
            ) : (
              <>
                {"Ti\u1ebfp t\u1ee5c"}{" "}
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>

      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {"Ch\u1ecdn ng\u00e0y \u0111\u1eb7t s\u00e2n"}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {
                    "Ch\u1ec9 xem \u0111\u01b0\u1ee3c t\u1eeb h\u00f4m nay \u0111\u1ebfn cu\u1ed1i th\u00e1ng sau."
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="Dong"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <input
              type="date"
              value={draftDate}
              min={minBookingDate}
              max={maxBookingDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                {"H\u1ee7y"}
              </button>
              <button
                type="button"
                onClick={applyDraftDate}
                className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                {"\u00c1p d\u1ee5ng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal bang gia */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {"B\u1ea3ng gi\u00e1 d\u1ecbch v\u1ee5"}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {
                    "Tham kh\u1ea3o m\u1ee9c gi\u00e1 theo lo\u1ea1i ng\u00e0y v\u00e0 khung gi\u1edd."
                  }
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
                      {"Lo\u1ea1i ng\u00e0y"}
                    </th>
                    <th className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700">
                      {"Khung gi\u1edd"}
                    </th>
                    <th className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-right text-slate-700">
                      {"M\u1ee9c gi\u00e1"}
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
                        {
                          "C\u01a1 s\u1edf n\u00e0y hi\u1ec7n ch\u01b0a thi\u1ebft l\u1eadp b\u1ea3ng gi\u00e1."
                        }
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

      {/* Ho tro scrollbar dep cho table */}
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
