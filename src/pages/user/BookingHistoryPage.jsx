import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleString("vi-VN");
};

const getStatusInfo = (status) => {
  switch (Number(status)) {
    case 0:
      return {
        label: "Giữ chỗ",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case 1:
      return {
        label: "Đã xác nhận",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case 2:
      return {
        label: "Đã hủy",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case 3:
      return {
        label: "Hết hạn",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
    case 4:
      return {
        label: "Hoàn thành",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    default:
      return {
        label: "Không xác định",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
  }
};

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

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
        showToast(
          err.response?.data?.message || "Không thể tải lịch sử đặt sân",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const sortedOrders = useMemo(() => orders, [orders]);

  const handlePayRemaining = async (order) => {
    setPayingId(order.id);
    try {
      const res = await api.post("/thanh-toan/vnpay/tao-url", {
        dat_san_id: order.id,
        loai_thanh_toan: "remaining",
      });

      if (!res.data?.payment_url) {
        throw new Error("Không nhận được đường dẫn thanh toán");
      }

      window.location.assign(res.data.payment_url);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Không thể tạo thanh toán phần còn lại",
        "error",
      );
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Lịch sử đặt sân
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Theo dõi các đơn đặt sân và thanh toán còn lại.
            </p>
          </div>
          <Link
            to="/trang-chu"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <i className="fa-solid fa-plus"></i>
            Đặt sân mới
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i>
              Đang tải lịch sử đặt sân...
            </div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <i className="fa-regular fa-calendar-xmark text-5xl text-slate-300"></i>
            <h2 className="mt-4 text-lg font-extrabold text-slate-900">
              Chưa có lịch sử đặt sân
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Khi bạn đặt sân, các đơn sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const status = getStatusInfo(order.trang_thai);
              const canPayRemaining =
                Number(order.trang_thai) === 1 && Number(order.con_lai) > 0;
              const address = [
                order.co_so?.dia_chi,
                order.co_so?.phuong_xa,
                order.co_so?.tinh_thanh,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <section
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-extrabold text-slate-900">
                          Đơn #{order.id}
                        </h2>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {order.co_so?.ten || "Cơ sở không xác định"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {address || "Chưa cập nhật địa chỉ"}
                      </p>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        Tạo lúc: {formatDateTime(order.ngay_tao)}
                      </p>
                    </div>

                    <div className="grid min-w-[260px] grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Tổng tiền
                        </p>
                        <p className="mt-1 font-extrabold text-slate-900">
                          {formatCurrency(order.thanh_tien)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Còn lại
                        </p>
                        <p className="mt-1 font-extrabold text-rose-600">
                          {formatCurrency(order.con_lai)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-3">
                      {order.chi_tiet.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm font-medium text-slate-500">
                          Không còn thông tin khung giờ cho đơn này.
                        </p>
                      ) : (
                        order.chi_tiet.map((item, index) => (
                          <div
                            key={`${order.id}-${item.san_id}-${item.khung_gio_mau_id}-${index}`}
                            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-bold text-slate-900">
                                {item.ten_san}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {formatDate(item.ngay)} | {item.gio_bat_dau} -{" "}
                                {item.gio_ket_thuc}
                              </p>
                            </div>
                            <p className="font-bold text-slate-900">
                              {formatCurrency(item.gia)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Đã thanh toán</span>
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(order.da_thanh_toan)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tiền cọc</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(order.tien_coc)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-3">
                          <span className="font-bold text-slate-700">
                            Còn phải trả
                          </span>
                          <span className="font-extrabold text-rose-600">
                            {formatCurrency(order.con_lai)}
                          </span>
                        </div>
                      </div>

                      {canPayRemaining && (
                        <button
                          type="button"
                          onClick={() => handlePayRemaining(order)}
                          disabled={payingId === order.id}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {payingId === order.id ? (
                            <>
                              <i className="fa-solid fa-circle-notch fa-spin"></i>
                              Đang tạo thanh toán
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-credit-card"></i>
                              Thanh toán phần còn lại
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
