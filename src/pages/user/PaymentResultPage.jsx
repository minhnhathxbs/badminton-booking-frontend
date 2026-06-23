import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import UserHeader from "../../components/common/UserHeader";

const TXT = {
  empty: "Ch\u01b0a c\u00f3",
  invalid: "D\u1eef li\u1ec7u thanh to\u00e1n kh\u00f4ng h\u1ee3p l\u1ec7",
  verifyFail: "Kh\u00f4ng th\u1ec3 x\u00e1c minh thanh to\u00e1n",
  loadingTitle: "\u0110ang x\u00e1c minh thanh to\u00e1n",
  loadingDesc: "Vui l\u00f2ng \u0111\u1ee3i trong gi\u00e2y l\u00e1t.",
  success: "Thanh to\u00e1n th\u00e0nh c\u00f4ng",
  fail: "Thanh to\u00e1n th\u1ea5t b\u1ea1i",
  processed: "Giao d\u1ecbch \u0111\u00e3 \u0111\u01b0\u1ee3c x\u1eed l\u00fd.",
  orderCode: "M\u00e3 \u0111\u1eb7t s\u00e2n",
  bookingStatus: "Tr\u1ea1ng th\u00e1i \u0111\u1eb7t s\u00e2n",
  paymentStatus: "Tr\u1ea1ng th\u00e1i thanh to\u00e1n",
  fullName: "H\u1ecd t\u00ean",
  phone: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
  note: "Ghi chú",
  courtInfo: "Th\u00f4ng tin s\u00e2n",
  facility: "C\u01a1 s\u1edf",
  playDate: "Ng\u00e0y ch\u01a1i",
  address: "\u0110\u1ecba ch\u1ec9",
  court: "S\u00e2n",
  timeSlot: "Khung gi\u1edd",
  noCourt: "Ch\u01b0a c\u00f3 th\u00f4ng tin s\u00e2n",
  noTime: "Ch\u01b0a c\u00f3 th\u00f4ng tin gi\u1edd",
  total: "T\u1ed5ng ti\u1ec1n",
  discount: "Khuyến mãi",
  payable: "Thành tiền",
  promoCode: "Mã giảm giá",
  deposit: "Ti\u1ec1n c\u1ecdc",
  paid: "\u0110\u00e3 thanh to\u00e1n",
  remain: "C\u00f2n l\u1ea1i",
  method: "Ph\u01b0\u01a1ng th\u1ee9c",
  transactionCode: "M\u00e3 giao d\u1ecbch",
  transactionAmount: "S\u1ed1 ti\u1ec1n giao d\u1ecbch",
  paidAt: "Th\u1eddi gian thanh to\u00e1n",
  noInvoice:
    "Ch\u01b0a l\u1ea5y \u0111\u01b0\u1ee3c th\u00f4ng tin h\u00f3a \u0111\u01a1n cho giao d\u1ecbch n\u00e0y.",
  home: "V\u1ec1 trang ch\u1ee7",
  history: "Xem l\u1ecbch s\u1eed \u0111\u1eb7t s\u00e2n",
  continueBooking: "Ti\u1ebfp t\u1ee5c \u0111\u1eb7t s\u00e2n",
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const formatDate = (value) => {
  if (!value) return TXT.empty;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return TXT.empty;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = Object.fromEntries(searchParams.entries());

      if (!params.vnp_TxnRef || !params.vnp_SecureHash) {
        setStatus("error");
        setResult({ message: TXT.invalid });
        return;
      }

      try {
        const res = await api.get("/thanh-toan/vnpay/return", { params });
        setResult(res.data);
        setStatus(res.data?.thanh_cong ? "success" : "error");
      } catch (err) {
        setStatus("error");
        setResult({
          message: err.response?.data?.message || TXT.verifyFail,
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  const isSuccess = status === "success";
  const invoice = result?.hoa_don;

  return (
    <div className="min-h-screen bg-[#f4f8ff] font-sans text-slate-800">
      <UserHeader />
      <main className="mx-auto flex min-h-[calc(100vh-112px)] w-full max-w-5xl items-center justify-center p-3">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {status === "loading" ? (
            <div className="py-10 text-center">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600"></i>
              <h1 className="mt-4 text-xl font-extrabold text-slate-900">
                {TXT.loadingTitle}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {TXT.loadingDesc}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isSuccess
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <i
                      className={`text-2xl ${
                        isSuccess
                          ? "fa-regular fa-circle-check"
                          : "fa-regular fa-circle-xmark"
                      }`}
                    ></i>
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900">
                      {isSuccess ? TXT.success : TXT.fail}
                    </h1>
                    <p className="mt-0.5 text-sm font-medium text-slate-500">
                      {result?.message || TXT.processed}
                    </p>
                  </div>
                </div>

                {invoice?.ma_dat_san && (
                  <div className="rounded-xl bg-blue-50 px-4 py-2 text-left sm:text-right">
                    <div className="text-[11px] font-bold uppercase text-blue-500">
                      {TXT.orderCode}
                    </div>
                    <div className="text-lg font-black text-blue-700">
                      {invoice.ma_dat_san}
                    </div>
                  </div>
                )}
              </div>

              {invoice ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                  <section className="rounded-2xl border border-slate-200 p-3">
                    <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-slate-900">
                      {TXT.courtInfo}
                    </h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <InfoItem label={TXT.facility} value={invoice.ten_co_so} />
                      <InfoItem label={TXT.playDate} value={formatDate(invoice.ngay_choi)} />
                      <div className="sm:col-span-2">
                        <InfoItem label={TXT.address} value={invoice.dia_chi} />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <ListBox title={TXT.court} items={invoice.san} emptyText={TXT.noCourt} />
                      <ListBox title={TXT.timeSlot} items={invoice.khung_gio} emptyText={TXT.noTime} />
                    </div>
                  </section>

                  <section className="rounded-2xl bg-slate-50 p-3">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      <InfoItem label={TXT.bookingStatus} value={invoice.trang_thai_dat_san} />
                      <InfoItem label={TXT.paymentStatus} value={invoice.trang_thai_thanh_toan} />
                      <InfoItem label={TXT.fullName} value={invoice.ho_ten} />
                      <InfoItem label={TXT.phone} value={invoice.so_dien_thoai} />
                      <InfoItem label={TXT.note} value={invoice.ghi_chu} />
                    </div>
                  </section>

                  <section className="grid gap-2 rounded-2xl border border-slate-200 p-3 sm:grid-cols-4 lg:col-span-2">
                    <InfoItem label={TXT.total} value={formatCurrency(invoice.tong_tien)} strong />
                    {Number(invoice.tien_giam || 0) > 0 && (
                      <>
                        <InfoItem
                          label={TXT.discount}
                          value={`-${formatCurrency(invoice.tien_giam)}`}
                        />
                        <InfoItem
                          label={TXT.payable}
                          value={formatCurrency(invoice.thanh_tien)}
                          strong
                        />
                        <InfoItem
                          label={TXT.promoCode}
                          value={invoice.khuyen_mai?.ma_khuyen_mai}
                        />
                      </>
                    )}
                    <InfoItem label={TXT.deposit} value={formatCurrency(invoice.tien_coc)} />
                    <InfoItem label={TXT.paid} value={formatCurrency(invoice.da_thanh_toan)} strong />
                    <InfoItem label={TXT.remain} value={formatCurrency(invoice.con_lai)} />
                  </section>

                  <section className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-4 lg:col-span-2">
                    <InfoItem label={TXT.method} value={invoice.phuong_thuc || "VNPAY"} />
                    <InfoItem label={TXT.transactionCode} value={invoice.ma_giao_dich} />
                    <InfoItem
                      label={TXT.transactionAmount}
                      value={formatCurrency(invoice.so_tien_giao_dich)}
                    />
                    <InfoItem
                      label={TXT.paidAt}
                      value={formatDateTime(invoice.thoi_gian_thanh_toan)}
                    />
                  </section>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-500">
                  {TXT.noInvoice}
                </div>
              )}

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Link
                  to="/trang-chu"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  {TXT.home}
                </Link>
                <Link
                  to="/lich-su-dat-san"
                  className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  {TXT.history}
                </Link>
                <Link
                  to="/trang-chu"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  {TXT.continueBooking}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value, strong = false }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`mt-0.5 break-words text-sm ${
          strong ? "font-black text-blue-700" : "font-bold text-slate-900"
        }`}
      >
        {value || TXT.empty}
      </div>
    </div>
  );
}

function ListBox({ title, items = [], emptyText }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-sm font-medium text-slate-400">{emptyText}</div>
      )}
    </div>
  );
}
