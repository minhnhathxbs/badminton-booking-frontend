import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import UserHeader from "../../components/common/UserHeader";
import { showToast } from "../../components/common/ToastMessage";

const TXT = {
  title: "Lịch sử đặt sân",
  desc: "Theo dõi đơn đặt sân, thanh toán và xem chi tiết khi cần.",
  newBooking: "Đặt sân mới",
  loading: "Đang tải lịch sử đặt sân...",
  emptyTitle: "Chưa có lịch sử đặt sân",
  emptyDesc: "Khi bạn đặt sân, các đơn sẽ hiển thị tại đây.",
  loadFail: "Không thể tải lịch sử đặt sân",
  noData: "Chưa có",
  unknownFacility: "Cơ sở không xác định",
  unknownAddress: "Chưa cập nhật địa chỉ",
  noSlot: "Không còn thông tin khung giờ cho đơn này.",
  viewDetail: "Xem chi tiết",
  close: "Đóng",
  index: "STT",
  facility: "Tên cơ sở",
  court: "Tên sân",
  playDate: "Ngày chơi",
  timeSlot: "Khung giờ",
  total: "Tổng tiền",
  originalTotal: "Tổng tiền sân",
  discount: "Khuyến mãi",
  promoCode: "Mã giảm giá",
  paid: "Đã thanh toán",
  status: "Trạng thái",
  booking: "Đơn đặt sân",
  createdAt: "Ngày tạo đơn",
  address: "Địa chỉ",
  deposit: "Tiền cọc",
  remain: "Còn lại",
  method: "Phương thức",
  detailTitle: "Chi tiết đơn đặt sân",
  note: "Ghi chú",
  cancelReason: "Lý do hủy",
  payDeposit: "Thanh toán",
  payDepositOnly: "Thanh toán cọc",
  payAll: "Thanh toán toàn bộ",
  payRemaining: "Thanh toán phần còn lại",
  paying: "Đang tạo thanh toán",
  cancel: "Hủy sân",
  cancelTitle: "Hủy đặt sân",
  cancelDesc: "Nhập lý do hủy. Hệ thống sẽ tự tính số tiền hoàn theo thời điểm hủy so với giờ chơi.",
  cancelPolicyTitle: "Chính sách hoàn tiền",
  cancelPlaceholder: "VD: Bận việc đột xuất, không thể đến sân...",
  cancelReasonRequired: "Vui lòng nhập lý do hủy",
  cancelSuccess: "Hủy đặt sân thành công",
  cancelFail: "Không thể hủy đặt sân",
  cancelling: "Đang hủy",
  confirmCancel: "Xác nhận hủy",
  complaint: "Khiếu nại",
  complaintTitle: "Gửi khiếu nại",
  complaintDesc: "Nhập lý do và tải hình ảnh chứng minh để Admin xử lý.",
  complaintPlaceholder: "VD: Sân bị ngập nước, cúp điện, chủ sân không cho đá...",
  complaintReasonRequired: "Vui lòng nhập lý do khiếu nại",
  complaintImageRequired: "Vui lòng tải lên ít nhất một hình ảnh",
  complaintSuccess: "Gửi khiếu nại thành công",
  complaintFail: "Không thể gửi khiếu nại",
  complaintSending: "Đang gửi",
  confirmComplaint: "Gửi khiếu nại",
  addImage: "Thêm hình ảnh",
  complaintPending: "KN chờ xử lý",
  complaintAccepted: "KN đã chấp nhận",
  complaintRejected: "KN bị từ chối",
  complaintFrozen: "Đang khiếu nại",
  paymentUrlFail: "Không nhận được đường dẫn thanh toán",
  paymentCreateFail: "Không thể tạo thanh toán",
  hold: "Đang chờ thanh toán",
  confirmed: "Đã cọc",
  paidFull: "Đã thanh toán",
  cancelled: "Đã hủy",
  paymentOverdue: "Quá hạn thanh toán",
  refundPending: "Hoàn tiền chờ xử lý",
  refundApproved: "Đã hoàn tiền",
  refundRejected: "Từ chối hoàn tiền",
  refundAmount: "Số tiền hoàn",
  refundNote: "Ghi chú hoàn tiền",
  expired: "Hết hạn giữ chỗ",
  completed: "Hoàn thành",
  complaintRefunded: "Khiếu nại đã hoàn tiền",
  unknown: "Không xác định",
  action: "Thao tác",
  choosePaymentType: "Chọn loại thanh toán",
};

const PAGE_SIZE = 10;

const DEFAULT_REFUND_POLICY = {
  moc_cao_nhat_gio: 24,
  phan_tram_cao_nhat: 100,
  moc_trung_gian_gio: 12,
  phan_tram_trung_gian: 50,
  phan_tram_duoi_moc_trung_gian: 0,
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatPolicyNumber = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

const buildRefundPolicyLines = (policy = DEFAULT_REFUND_POLICY) => {
  const highHour = formatPolicyNumber(policy.moc_cao_nhat_gio);
  const highPercent = formatPolicyNumber(policy.phan_tram_cao_nhat);
  const midHour = formatPolicyNumber(policy.moc_trung_gian_gio);
  const midPercent = formatPolicyNumber(policy.phan_tram_trung_gian);
  const latePercent = Number(policy.phan_tram_duoi_moc_trung_gian || 0);
  const latePercentText = formatPolicyNumber(latePercent);

  return [
    `Trước giờ chơi từ ${highHour} giờ: hoàn ${highPercent}% số tiền đã thanh toán.`,
    `Trước giờ chơi từ ${midHour} đến dưới ${highHour} giờ: hoàn ${midPercent}%.`,
    latePercent > 0
      ? `Dưới ${midHour} giờ nhưng chưa tới giờ chơi: hoàn ${latePercentText}%.`
      : `Dưới ${midHour} giờ nhưng chưa tới giờ chơi: vẫn được hủy, không hoàn tiền.`,
  ];
};

const formatDate = (value) => {
  if (!value) return TXT.noData;
  return new Date(value).toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) return TXT.noData;
  return new Date(value).toLocaleString("vi-VN");
};

const formatTime = (value) => String(value || "").slice(0, 5);

const getPaymentMethodLabel = (order) => {
  if (Number(order.da_thanh_toan || 0) <= 0) return "Chưa thanh toán";
  return order.phuong_thuc || "Chưa cập nhật";
};

const formatLocalDateKey = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return String(value).slice(0, 10);
};

const getEarliestStartDate = (order) => {
  const starts = (order.chi_tiet || [])
    .map((item) => {
      const datePart = formatLocalDateKey(item.ngay);
      const startTime = formatTime(item.gio_bat_dau);
      if (!datePart || !startTime) return null;

      const startDate = new Date(`${datePart}T${startTime}:00`);
      return Number.isNaN(startDate.getTime()) ? null : startDate;
    })
    .filter(Boolean);

  if (!starts.length) return null;
  return starts.reduce((earliest, date) => (date < earliest ? date : earliest));
};

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const getCourtNames = (order) =>
  unique((order.chi_tiet || []).map((item) => item.ten_san));

const getTimeSlots = (order) =>
  unique(
    (order.chi_tiet || []).map(
      (item) => `${formatTime(item.gio_bat_dau)} - ${formatTime(item.gio_ket_thuc)}`,
    ),
  );

const getPlayDates = (order) =>
  unique((order.chi_tiet || []).map((item) => formatDate(item.ngay)));

const getAddress = (order) =>
  [
    order.co_so?.dia_chi,
    order.co_so?.phuong_xa,
    order.co_so?.tinh_thanh,
  ]
    .filter(Boolean)
    .join(", ");

const isHoldExpired = (order) =>
  Number(order.trang_thai) === 0 &&
  order.thoi_gian_het_han &&
  new Date(order.thoi_gian_het_han) < new Date();

const isExpiredHoldCancel = (order) =>
  Number(order.trang_thai) === 2 &&
  Number(order.da_thanh_toan || 0) === 0 &&
  String(order.ly_do_huy || "").toLowerCase().includes("hết hạn");

const isPaymentOverdueCancel = (order) =>
  Number(order.trang_thai) === 2 &&
  String(order.ly_do_huy || "").toLowerCase().includes("quá hạn thanh toán");

const isCancelledLike = (order) => Number(order.trang_thai) === 2;

const canComplainOrder = (order) => {
  if (![1, 4].includes(Number(order.trang_thai))) return false;
  if (!order.khieu_nai) return true;
  // Cho phép khiếu nại lại nếu khiếu nại trước đó đã bị từ chối
  return Number(order.khieu_nai.trang_thai) === 2;
};

const getComplaintStatusInfo = (khieuNai) => {
  if (!khieuNai) return null;

  switch (Number(khieuNai.trang_thai)) {
    case 0:
      return {
        label: TXT.complaintPending,
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    case 1:
      return {
        label: TXT.complaintAccepted,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case 2:
      return {
        label: TXT.complaintRejected,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    default:
      return null;
  }
};

const canCancelOrder = (order) => {
  if (![0, 1].includes(Number(order.trang_thai))) return false;
  if (isHoldExpired(order)) return false;

  const earliestStart = getEarliestStartDate(order);
  if (!earliestStart) return false;

  return new Date() < earliestStart;
};

const getPaymentKind = (order) => {
  const total = Number(order.thanh_tien || 0);
  const paid = Number(order.da_thanh_toan || 0);
  const bookingStatus = Number(order.trang_thai);

  if (bookingStatus === 4) return "completed";
  if (bookingStatus === 5) return "complaint";
  if (bookingStatus === 6) return "complaintRefunded";
  if (bookingStatus === 2) {
    if (isPaymentOverdueCancel(order)) return "paymentOverdue";
    return isExpiredHoldCancel(order) ? "expired" : "cancelled";
  }
  if (bookingStatus === 0 && isHoldExpired(order)) return "expired";
  if (paid >= total && total > 0) return "paid";
  if (paid > 0) return "deposit";
  if (bookingStatus === 0) return "waiting";
  return "unknown";
};

const getStatusInfo = (order) => {
  switch (getPaymentKind(order)) {
    case "waiting":
      return {
        label: TXT.hold,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "deposit":
      return {
        label: TXT.confirmed,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "paid":
      return {
        label: TXT.paidFull,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "cancelled":
      return {
        label: TXT.cancelled,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "paymentOverdue":
      return {
        label: TXT.paymentOverdue,
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    case "expired":
      return {
        label: TXT.expired,
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
    case "completed":
      return {
        label: TXT.completed,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "complaint":
      return {
        label: TXT.complaintFrozen,
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    case "complaintRefunded":
      return {
        label: TXT.complaintRefunded,
        className: "bg-purple-50 text-purple-700 border-purple-200",
      };
    default:
      return {
        label: TXT.unknown,
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
  }
};

const getRefundStatusInfo = (refund) => {
  if (!refund) return null;

  switch (Number(refund.trang_thai)) {
    case 0:
      return {
        label: TXT.refundPending,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case 1:
      return {
        label: TXT.refundApproved,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case 2:
      return {
        label: TXT.refundRejected,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    default:
      return {
        label: TXT.unknown,
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
  }
};

const getPrimaryAction = (order) => {
  const kind = getPaymentKind(order);
  if (kind === "waiting") {
    return { label: TXT.payDeposit, type: "choose" };
  }
  if (
    kind === "deposit" &&
    Number(order.con_lai) > 0 &&
    new Date() < getEarliestStartDate(order)
  ) {
    return { label: TXT.payRemaining, type: "remaining" };
  }
  return null;
};

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentChoiceOrder, setPaymentChoiceOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [complaintOrder, setComplaintOrder] = useState(null);
  const [complaintReason, setComplaintReason] = useState("");
  const [complaintImages, setComplaintImages] = useState([]);
  const [complaintSending, setComplaintSending] = useState(false);
  const [page, setPage] = useState(1);
  const [refundPolicy, setRefundPolicy] = useState(DEFAULT_REFUND_POLICY);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/dat-san/lich-su-cua-toi");
        setOrders(res.data || []);
        setPage(1);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/dang-nhap");
          return;
        }
        showToast(err.response?.data?.message || TXT.loadFail, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    const fetchRefundPolicy = async () => {
      try {
        const res = await api.get("/cau-hinh/chinh-sach-hoan-tien");
        setRefundPolicy(res.data || DEFAULT_REFUND_POLICY);
      } catch {
        setRefundPolicy(DEFAULT_REFUND_POLICY);
      }
    };

    fetchRefundPolicy();
  }, []);

  const refundPolicyLines = useMemo(
    () => buildRefundPolicyLines(refundPolicy),
    [refundPolicy],
  );

  const sortedOrders = useMemo(() => orders, [orders]);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedOrders.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedOrders]);

  const handlePay = async (order, type) => {
    if (type === "choose") {
      setPaymentChoiceOrder(order);
      return;
    }

    setPayingId(order.id);
    try {
      const res = await api.post("/thanh-toan/vnpay/tao-url", {
        dat_san_id: order.id,
        loai_thanh_toan: type,
      });

      if (!res.data?.payment_url) {
        throw new Error(TXT.paymentUrlFail);
      }

      setPaymentChoiceOrder(null);
      window.location.assign(res.data.payment_url);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || TXT.paymentCreateFail,
        "error",
      );
    } finally {
      setPayingId(null);
    }
  };

  const handleOpenComplaint = (order) => {
    setComplaintOrder(order);
    setComplaintReason("");
    setComplaintImages([]);
  };

  const handleComplaintImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    setComplaintImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    setComplaintImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmComplaint = async () => {
    const reason = complaintReason.trim();
    if (!reason) {
      showToast(TXT.complaintReasonRequired, "error");
      return;
    }
    if (complaintImages.length === 0) {
      showToast(TXT.complaintImageRequired, "error");
      return;
    }

    setComplaintSending(true);
    try {
      const formData = new FormData();
      formData.append("dat_san_id", complaintOrder.id);
      formData.append("ly_do", reason);
      complaintImages.forEach((file) => formData.append("hinh_anh", file));

      const res = await api.post("/khieu-nai", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = {
        ...complaintOrder,
        trang_thai: 5,
        khieu_nai: {
          id: res.data?.data?.id,
          trang_thai: 0,
          ly_do: reason,
        },
      };

      setOrders((prev) =>
        prev.map((o) => (o.id === complaintOrder.id ? updated : o)),
      );
      setSelectedOrder((prev) =>
        prev?.id === complaintOrder.id ? { ...updated, stt: prev.stt } : prev,
      );
      setComplaintOrder(null);
      setComplaintReason("");
      setComplaintImages([]);
      showToast(res.data?.message || TXT.complaintSuccess);
    } catch (err) {
      showToast(err.response?.data?.message || TXT.complaintFail, "error");
    } finally {
      setComplaintSending(false);
    }
  };

  const handleOpenCancel = (order) => {
    setCancelOrder(order);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      showToast(TXT.cancelReasonRequired, "error");
      return;
    }

    setCancellingId(cancelOrder.id);
    try {
      const res = await api.patch(`/huy-dat-san/${cancelOrder.id}`, {
        ly_do_huy: reason,
      });

      const updated = {
        ...cancelOrder,
        trang_thai: res.data?.trang_thai ?? 2,
        ly_do_huy: res.data?.ly_do_huy || reason,
        hoan_tien: res.data?.yeu_cau_hoan_tien || cancelOrder.hoan_tien,
      };

      setOrders((prev) =>
        prev.map((order) => (order.id === cancelOrder.id ? updated : order)),
      );
      setSelectedOrder((prev) =>
        prev?.id === cancelOrder.id ? { ...updated, stt: prev.stt } : prev,
      );
      setCancelOrder(null);
      setCancelReason("");
      showToast(res.data?.message || TXT.cancelSuccess);
    } catch (err) {
      showToast(err.response?.data?.message || TXT.cancelFail, "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] text-slate-800">
      <UserHeader />
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {TXT.title}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {TXT.desc}
            </p>
          </div>
          <Link
            to="/trang-chu"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <i className="fa-solid fa-plus"></i>
            {TXT.newBooking}
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i>
              {TXT.loading}
            </div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <i className="fa-regular fa-calendar-xmark text-5xl text-slate-300"></i>
            <h2 className="mt-4 text-lg font-extrabold text-slate-900">
              {TXT.emptyTitle}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {TXT.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <Th>{TXT.index}</Th>
                    <Th>{TXT.facility}</Th>
                    <Th>{TXT.court}</Th>
                    <Th>{TXT.playDate}</Th>
                    <Th>{TXT.timeSlot}</Th>
                    <Th>{TXT.total}</Th>
                    <Th>{TXT.paid}</Th>
                    <Th>{TXT.status}</Th>
                    <Th>{TXT.createdAt}</Th>
                    <Th>{TXT.action}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedOrders.map((order, index) => {
                    const orderIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
                    const status = getStatusInfo(order);
                    const refundStatus = getRefundStatusInfo(order.hoan_tien);
                    const complaintStatus = getComplaintStatusInfo(order.khieu_nai);
                    const courtNames = getCourtNames(order);
                    const timeSlots = getTimeSlots(order);
                    const playDates = getPlayDates(order);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <Td strong>{orderIndex}</Td>
                        <Td>{order.co_so?.ten || TXT.unknownFacility}</Td>
                        <Td>{courtNames.join(", ") || TXT.noData}</Td>
                        <Td>{playDates.join(", ") || TXT.noData}</Td>
                        <Td>{timeSlots.join(", ") || TXT.noData}</Td>
                        <Td strong>{formatCurrency(order.thanh_tien)}</Td>
                        <Td>{formatCurrency(order.da_thanh_toan)}</Td>
                        <Td>
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                            {refundStatus && (
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${refundStatus.className}`}
                              >
                                {refundStatus.label}
                              </span>
                            )}
                            {complaintStatus && (
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${complaintStatus.className}`}
                              >
                                {complaintStatus.label}
                              </span>
                            )}
                            {Number(order.trang_thai) === 5 && !order.khieu_nai && (
                              <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                                {TXT.complaintFrozen}
                              </span>
                            )}
                          </div>
                        </Td>
                        <Td>{formatDateTime(order.ngay_tao)}</Td>
                        <Td>
                          <div className="flex min-w-[92px] justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder({ ...order, stt: orderIndex })}
                              title={TXT.viewDetail}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                            {canComplainOrder(order) && (
                              <button
                                type="button"
                                onClick={() => handleOpenComplaint({ ...order, stt: orderIndex })}
                                title={TXT.complaint}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 text-sm text-orange-600 hover:bg-orange-50"
                              >
                                <i className="fa-solid fa-flag"></i>
                              </button>
                            )}
                            {canCancelOrder(order) && (
                              <button
                                type="button"
                                onClick={() => handleOpenCancel({ ...order, stt: orderIndex })}
                                title={TXT.cancel}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-sm text-rose-600 hover:bg-rose-50"
                              >
                                <i className="fa-solid fa-ban"></i>
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={sortedOrders.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          payingId={payingId}
          onClose={() => setSelectedOrder(null)}
          onPay={handlePay}
          onCancel={handleOpenCancel}
          onComplaint={handleOpenComplaint}
        />
      )}

      {paymentChoiceOrder && (
        <PaymentChoiceModal
          order={paymentChoiceOrder}
          payingId={payingId}
          onClose={() => setPaymentChoiceOrder(null)}
          onPay={handlePay}
        />
      )}

      {cancelOrder && (
        <CancelBookingModal
          order={cancelOrder}
          reason={cancelReason}
          policyLines={refundPolicyLines}
          loading={cancellingId === cancelOrder.id}
          onReasonChange={setCancelReason}
          onClose={() => setCancelOrder(null)}
          onConfirm={handleConfirmCancel}
        />
      )}

      {complaintOrder && (
        <ComplaintModal
          order={complaintOrder}
          reason={complaintReason}
          images={complaintImages}
          loading={complaintSending}
          onReasonChange={setComplaintReason}
          onImageChange={handleComplaintImageChange}
          onRemoveImage={handleRemoveImage}
          onClose={() => setComplaintOrder(null)}
          onConfirm={handleConfirmComplaint}
        />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, total, onPageChange }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div>
        Trang {page}/{totalPages} · {total} đơn đặt sân
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange((current) => Math.max(1, current - 1))}
          className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trước
        </button>
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() =>
            onPageChange((current) => Math.min(totalPages, current + 1))
          }
          className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
}

function PaymentChoiceModal({ order, payingId, onClose, onPay }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {TXT.choosePaymentType}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {order.co_so?.ten || TXT.unknownFacility}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label={TXT.close}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => onPay(order, "deposit")}
            disabled={payingId === order.id}
            className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-bold text-blue-700">{TXT.payDepositOnly}</span>
            <span className="font-extrabold text-blue-700">
              {formatCurrency(order.tien_coc)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onPay(order, "full")}
            disabled={payingId === order.id}
            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-bold text-emerald-700">{TXT.payAll}</span>
            <span className="font-extrabold text-emerald-700">
              {formatCurrency(order.thanh_tien)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, payingId, onClose, onPay, onCancel, onComplaint }) {
  const action = getPrimaryAction(order);
  const status = getStatusInfo(order);
  const refundStatus = getRefundStatusInfo(order.hoan_tien);
  const courtNames = getCourtNames(order);
  const timeSlots = getTimeSlots(order);
  const playDates = getPlayDates(order);
  const address = getAddress(order);
  const canShowCancel = canCancelOrder(order);
  const canShowComplaint = canComplainOrder(order);
  const complaintStatus = getComplaintStatusInfo(order.khieu_nai);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {TXT.detailTitle}
            </h2>
            <p className="mt-0.5 text-sm font-bold text-blue-700">
              {TXT.index}: {order.stt || order.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label={TXT.close}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <section className="rounded-2xl bg-slate-50 p-4">
            <InfoLine label={TXT.facility} value={order.co_so?.ten || TXT.unknownFacility} />
            <InfoLine label={TXT.address} value={address || TXT.unknownAddress} />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <InfoTitle>{TXT.court}</InfoTitle>
              {courtNames.length ? (
                courtNames.map((name) => (
                  <p key={name} className="mt-2 font-bold text-slate-900">
                    {name}
                  </p>
                ))
              ) : (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {TXT.noData}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <InfoTitle>{TXT.playDate}</InfoTitle>
              <p className="mt-2 font-bold text-slate-900">
                {playDates.join(", ") || TXT.noData}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <InfoTitle>{TXT.timeSlot}</InfoTitle>
            {timeSlots.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-500">
                {TXT.noSlot}
              </p>
            )}
          </section>

          <section className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            {Number(order.tien_giam || 0) > 0 && (
              <>
                <InfoLine
                  label={TXT.originalTotal}
                  value={formatCurrency(order.tong_tien)}
                />
                <InfoLine
                  label={TXT.discount}
                  value={`-${formatCurrency(order.tien_giam)}`}
                />
                <InfoLine
                  label={TXT.promoCode}
                  value={order.khuyen_mai?.ma_khuyen_mai || TXT.noData}
                />
              </>
            )}
            <InfoLine label={TXT.total} value={formatCurrency(order.thanh_tien)} />
            <InfoLine label={TXT.deposit} value={formatCurrency(order.tien_coc)} />
            <InfoLine label={TXT.paid} value={formatCurrency(order.da_thanh_toan)} />
            <InfoLine label={TXT.remain} value={formatCurrency(order.con_lai)} />
            <InfoLine label={TXT.method} value={getPaymentMethodLabel(order)} />
            <InfoLine label={TXT.note} value={order.ghi_chu || TXT.noData} />
            {isCancelledLike(order) && (
              <InfoLine
                label={TXT.cancelReason}
                value={order.ly_do_huy || TXT.noData}
              />
            )}
            {order.hoan_tien && (
              <>
                <InfoLine
                  label={TXT.refundAmount}
                  value={formatCurrency(order.hoan_tien.so_tien_hoan)}
                />
                <InfoLine
                  label={TXT.refundNote}
                  value={order.hoan_tien.ghi_chu_admin || TXT.noData}
                />
              </>
            )}
            <div>
              <div className="text-xs font-bold uppercase text-slate-500">
                {TXT.status}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}
                >
                  {status.label}
                </span>
                {refundStatus && (
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${refundStatus.className}`}
                  >
                    {refundStatus.label}
                  </span>
                )}
                {complaintStatus && (
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${complaintStatus.className}`}
                  >
                    {complaintStatus.label}
                  </span>
                )}
                {Number(order.trang_thai) === 5 && !order.khieu_nai && (
                  <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                    {TXT.complaintFrozen}
                  </span>
                )}
              </div>
            </div>
          </section>

          {order.khieu_nai && (
            <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <InfoTitle>{TXT.complaint}</InfoTitle>
              <p className="mt-2 text-sm font-bold text-slate-900">{order.khieu_nai.ly_do || TXT.noData}</p>
              {order.khieu_nai.ghi_chu_admin && (
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Ghi chú Admin: {order.khieu_nai.ghi_chu_admin}
                </p>
              )}
            </section>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {action && (
              <button
                type="button"
                onClick={() => onPay(order, action.type)}
                disabled={payingId === order.id}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {payingId === order.id ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    {TXT.paying}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-credit-card"></i>
                    {action.label}
                  </>
                )}
              </button>
            )}

            {canShowComplaint && (
              <button
                type="button"
                onClick={() => onComplaint(order)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50"
              >
                <i className="fa-solid fa-flag"></i>
                {TXT.complaint}
              </button>
            )}

            {canShowCancel && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <i className="fa-solid fa-ban"></i>
                {TXT.cancel}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              {TXT.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelBookingModal({
  order,
  reason,
  policyLines,
  loading,
  onReasonChange,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {TXT.cancelTitle}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {order.co_so?.ten || TXT.unknownFacility}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-60"
            aria-label={TXT.close}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm font-medium leading-6 text-slate-600">
            {TXT.cancelDesc}
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="mb-2 flex items-center gap-2 font-extrabold">
              <i className="fa-solid fa-circle-info"></i>
              {TXT.cancelPolicyTitle}
            </div>
            <ul className="space-y-1 font-medium">
              {policyLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder={TXT.cancelPlaceholder}
            disabled={loading}
            className="h-32 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-rose-400 disabled:bg-slate-50"
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {TXT.close}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  {TXT.cancelling}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-ban"></i>
                  {TXT.confirmCancel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintModal({
  order,
  reason,
  images,
  loading,
  onReasonChange,
  onImageChange,
  onRemoveImage,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {TXT.complaintTitle}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {order.co_so?.ten || TXT.unknownFacility} - {TXT.booking} #{order.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-60"
            aria-label={TXT.close}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm font-medium leading-6 text-slate-600">
            {TXT.complaintDesc}
          </p>

          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder={TXT.complaintPlaceholder}
            disabled={loading}
            className="h-32 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-orange-400 disabled:bg-slate-50"
          />

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
              {TXT.addImage} ({images.length}/5)
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => (
                <div key={index} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    disabled={loading}
                    className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white opacity-0 group-hover:opacity-100"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500">
                  <i className="fa-solid fa-plus text-lg"></i>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {TXT.close}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  {TXT.complaintSending}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-flag"></i>
                  {TXT.confirmComplaint}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children, strong = false }) {
  return (
    <td
      className={`max-w-[220px] px-4 py-3 align-top ${
        strong ? "font-extrabold text-slate-900" : "font-medium text-slate-600"
      }`}
    >
      <div className="line-clamp-2">{children}</div>
    </td>
  );
}

function InfoTitle({ children }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <InfoTitle>{label}</InfoTitle>
      <div className="mt-1 break-words text-sm font-bold text-slate-900">
        {value || TXT.noData}
      </div>
    </div>
  );
}

