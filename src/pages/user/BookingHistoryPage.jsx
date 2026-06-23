import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import UserHeader from "../../components/common/UserHeader";
import { showToast } from "../../components/common/ToastMessage";

const TXT = {
  title: "L\u1ecbch s\u1eed \u0111\u1eb7t s\u00e2n",
  desc: "Theo d\u00f5i \u0111\u01a1n \u0111\u1eb7t s\u00e2n, thanh to\u00e1n v\u00e0 xem chi ti\u1ebft khi c\u1ea7n.",
  newBooking: "\u0110\u1eb7t s\u00e2n m\u1edbi",
  loading: "\u0110ang t\u1ea3i l\u1ecbch s\u1eed \u0111\u1eb7t s\u00e2n...",
  emptyTitle: "Ch\u01b0a c\u00f3 l\u1ecbch s\u1eed \u0111\u1eb7t s\u00e2n",
  emptyDesc: "Khi b\u1ea1n \u0111\u1eb7t s\u00e2n, c\u00e1c \u0111\u01a1n s\u1ebd hi\u1ec3n th\u1ecb t\u1ea1i \u0111\u00e2y.",
  loadFail: "Kh\u00f4ng th\u1ec3 t\u1ea3i l\u1ecbch s\u1eed \u0111\u1eb7t s\u00e2n",
  noData: "Ch\u01b0a c\u00f3",
  unknownFacility: "C\u01a1 s\u1edf kh\u00f4ng x\u00e1c \u0111\u1ecbnh",
  unknownAddress: "Ch\u01b0a c\u1eadp nh\u1eadt \u0111\u1ecba ch\u1ec9",
  noSlot: "Kh\u00f4ng c\u00f2n th\u00f4ng tin khung gi\u1edd cho \u0111\u01a1n n\u00e0y.",
  viewDetail: "Xem chi ti\u1ebft",
  close: "\u0110\u00f3ng",
  index: "STT",
  facility: "T\u00ean c\u01a1 s\u1edf",
  court: "T\u00ean s\u00e2n",
  playDate: "Ng\u00e0y ch\u01a1i",
  timeSlot: "Khung gi\u1edd",
  total: "T\u1ed5ng ti\u1ec1n",
  originalTotal: "Tổng tiền sân",
  discount: "Khuyến mãi",
  promoCode: "Mã giảm giá",
  paid: "\u0110\u00e3 thanh to\u00e1n",
  status: "Tr\u1ea1ng th\u00e1i",
  createdAt: "Ng\u00e0y t\u1ea1o \u0111\u01a1n",
  address: "\u0110\u1ecba ch\u1ec9",
  deposit: "Ti\u1ec1n c\u1ecdc",
  remain: "C\u00f2n l\u1ea1i",
  method: "Ph\u01b0\u01a1ng th\u1ee9c",
  detailTitle: "Chi ti\u1ebft \u0111\u01a1n \u0111\u1eb7t s\u00e2n",
  note: "Ghi chú",
  cancelReason: "Lý do hủy",
  payDeposit: "Thanh to\u00e1n",
  payDepositOnly: "Thanh to\u00e1n c\u1ecdc",
  payAll: "Thanh to\u00e1n to\u00e0n b\u1ed9",
  payRemaining: "Thanh to\u00e1n ph\u1ea7n c\u00f2n l\u1ea1i",
  paying: "\u0110ang t\u1ea1o thanh to\u00e1n",
  cancel: "H\u1ee7y s\u00e2n",
  cancelTitle: "H\u1ee7y \u0111\u1eb7t s\u00e2n",
  cancelDesc: "Nh\u1eadp l\u00fd do h\u1ee7y \u0111\u1ec3 ch\u1ee7 s\u00e2n xem x\u00e9t ho\u00e0n ti\u1ec1n n\u1ebfu \u0111\u01a1n \u0111\u00e3 thanh to\u00e1n.",
  cancelPlaceholder: "VD: B\u1eadn vi\u1ec7c \u0111\u1ed9t xu\u1ea5t, kh\u00f4ng th\u1ec3 \u0111\u1ebfn s\u00e2n...",
  cancelReasonRequired: "Vui l\u00f2ng nh\u1eadp l\u00fd do h\u1ee7y",
  cancelSuccess: "H\u1ee7y \u0111\u1eb7t s\u00e2n th\u00e0nh c\u00f4ng",
  cancelFail: "Kh\u00f4ng th\u1ec3 h\u1ee7y \u0111\u1eb7t s\u00e2n",
  cancelling: "\u0110ang h\u1ee7y",
  confirmCancel: "X\u00e1c nh\u1eadn h\u1ee7y",
  paymentUrlFail: "Kh\u00f4ng nh\u1eadn \u0111\u01b0\u1ee3c \u0111\u01b0\u1eddng d\u1eabn thanh to\u00e1n",
  paymentCreateFail: "Kh\u00f4ng th\u1ec3 t\u1ea1o thanh to\u00e1n",
  hold: "\u0110ang ch\u1edd thanh to\u00e1n",
  confirmed: "\u0110\u00e3 c\u1ecdc",
  paidFull: "\u0110\u00e3 thanh to\u00e1n",
  cancelled: "\u0110\u00e3 h\u1ee7y",
  refundPending: "Ho\u00e0n ti\u1ec1n ch\u1edd x\u1eed l\u00fd",
  refundApproved: "\u0110\u00e3 ho\u00e0n ti\u1ec1n",
  refundRejected: "T\u1eeb ch\u1ed1i ho\u00e0n ti\u1ec1n",
  refundAmount: "S\u1ed1 ti\u1ec1n ho\u00e0n",
  refundNote: "Ghi ch\u00fa ho\u00e0n ti\u1ec1n",
  expired: "H\u1ebft h\u1ea1n",
  completed: "Ho\u00e0n th\u00e0nh",
  unknown: "Kh\u00f4ng x\u00e1c \u0111\u1ecbnh",
  action: "Thao t\u00e1c",
  choosePaymentType: "Ch\u1ecdn lo\u1ea1i thanh to\u00e1n",
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}\u0111`;

const formatDate = (value) => {
  if (!value) return TXT.noData;
  return new Date(value).toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) return TXT.noData;
  return new Date(value).toLocaleString("vi-VN");
};

const formatTime = (value) => String(value || "").slice(0, 5);

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

const isCancelledLike = (order) => {
  return Number(order.trang_thai) === 2;
};

const canCancelOrder = (order) => {
  if (![0, 1].includes(Number(order.trang_thai))) return false;

  const earliestStart = getEarliestStartDate(order);
  if (!earliestStart) return false;

  const cancelDeadline = new Date(earliestStart.getTime() - 2 * 60 * 60 * 1000);
  return new Date() < cancelDeadline;
};

const getPaymentKind = (order) => {
  const total = Number(order.thanh_tien || 0);
  const paid = Number(order.da_thanh_toan || 0);

  if (isCancelledLike(order)) return "cancelled";
  if (paid >= total && total > 0) return "paid";
  if (paid > 0) return "deposit";
  if (Number(order.trang_thai) === 0 && !isHoldExpired(order)) return "waiting";
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
  if (kind === "deposit" && Number(order.con_lai) > 0) {
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

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/dat-san/lich-su-cua-toi");
        setOrders(res.data || []);
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

  const sortedOrders = useMemo(() => orders, [orders]);

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
                  {sortedOrders.map((order, index) => {
                    const status = getStatusInfo(order);
                    const refundStatus = getRefundStatusInfo(order.hoan_tien);
                    const courtNames = getCourtNames(order);
                    const timeSlots = getTimeSlots(order);
                    const playDates = getPlayDates(order);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <Td strong>{index + 1}</Td>
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
                          </div>
                        </Td>
                        <Td>{formatDateTime(order.ngay_tao)}</Td>
                        <Td>
                          <div className="flex min-w-[92px] justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder({ ...order, stt: index + 1 })}
                              title={TXT.viewDetail}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <i className="fa-regular fa-eye"></i>
                            </button>
                            {canCancelOrder(order) && (
                              <button
                                type="button"
                                onClick={() => handleOpenCancel({ ...order, stt: index + 1 })}
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
          loading={cancellingId === cancelOrder.id}
          onReasonChange={setCancelReason}
          onClose={() => setCancelOrder(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
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

function OrderDetailModal({ order, payingId, onClose, onPay, onCancel }) {
  const action = getPrimaryAction(order);
  const status = getStatusInfo(order);
  const refundStatus = getRefundStatusInfo(order.hoan_tien);
  const courtNames = getCourtNames(order);
  const timeSlots = getTimeSlots(order);
  const playDates = getPlayDates(order);
  const address = getAddress(order);
  const canShowCancel = canCancelOrder(order);

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
            <InfoLine label={TXT.method} value={order.phuong_thuc || "VNPay"} />
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
              </div>
            </div>
          </section>

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

