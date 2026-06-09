import React, { useMemo, useState } from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import heroImage from "../../assets/hero.png";

const HOURS = Array.from({ length: 15 }, (_, index) => 8 + index);

const COURTS = [
  { id: 1, name: "Sân 1", category: "Thảm tiêu chuẩn" },
  { id: 2, name: "Sân 2", category: "Thảm tiêu chuẩn" },
  { id: 3, name: "Sân 3", category: "Thảm tiêu chuẩn" },
  { id: 4, name: "Sân 4", category: "Sân VIP" },
  { id: 5, name: "Sân 5", category: "Sân VIP" },
  { id: 6, name: "Sân 6", category: "Thảm thi đấu" },
];

const BOOKED_SLOTS = new Set([
  "1-18",
  "1-19",
  "1-20",
  "2-16",
  "2-17",
  "3-19",
  "3-20",
  "4-13",
  "4-14",
  "4-15",
  "5-10",
  "5-11",
  "6-21",
]);

const CLOSED_SLOTS = new Set(["1-8", "2-8", "3-8", "4-8", "5-8", "6-8"]);

const PRICE_TABLE = [
  { day: "T2 - T6", time: "05h - 16h", price: 60000 },
  { day: "T2 - T6", time: "16h - 22h", price: 120000 },
  { day: "T2 - T6", time: "22h - 24h", price: 60000 },
  { day: "T7 - CN", time: "05h - 24h", price: 120000 },
  { day: "T2 - CN", time: "00h - 05h", price: 160000 },
];

const REVIEWS = [
  {
    id: 1,
    name: "Minh Khang",
    rating: 5,
    date: "02/06/2026",
    content:
      "Sân sạch, ánh sáng ổn, đặt lịch nhanh. Khu chờ hơi nhỏ nhưng tổng thể đáng quay lại.",
  },
  {
    id: 2,
    name: "Hoài An",
    rating: 4,
    date: "29/05/2026",
    content:
      "Giờ cao điểm khá đông, nên đặt trước. Nhân viên hỗ trợ đổi sân nhanh khi cần.",
  },
  {
    id: 3,
    name: "Quốc Bảo",
    rating: 5,
    date: "18/05/2026",
    content:
      "Mặt sân VIP bám tốt, giá cuối tuần chấp nhận được. Có bãi xe tiện.",
  },
];

const formatHour = (hour) => `${String(hour).padStart(2, "0")}:00`;

const getSlotPrice = (hour) => (hour >= 17 ? 120000 : 80000);

const formatCurrency = (value) => `${value.toLocaleString("vi-VN")}đ`;

export default function FacilityDetailPage() {
  const [selectedDate, setSelectedDate] = useState("2026-06-13");
  const [selectedSlots, setSelectedSlots] = useState(new Set(["4-17", "4-18"]));
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [bookingStep, setBookingStep] = useState("select");
  const [showQrPayment, setShowQrPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("deposit");

  const selectedItems = useMemo(() => {
    return Array.from(selectedSlots)
      .map((slotKey) => {
        const [courtId, hour] = slotKey.split("-").map(Number);
        const court = COURTS.find((item) => item.id === courtId);

        return {
          key: slotKey,
          courtName: court?.name || "",
          hour,
          price: getSlotPrice(hour),
        };
      })
      .sort(
        (a, b) => a.courtName.localeCompare(b.courtName) || a.hour - b.hour,
      );
  }, [selectedSlots]);

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const deposit = Math.round(totalPrice * 0.3);
  const paymentAmount = paymentType === "full" ? totalPrice : deposit;
  const remainingAmount = totalPrice - paymentAmount;
  const totalHours = selectedItems.length;

  const toggleSlot = (courtId, hour) => {
    const slotKey = `${courtId}-${hour}`;
    if (BOOKED_SLOTS.has(slotKey) || CLOSED_SLOTS.has(slotKey)) return;

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

  const goToConfirm = () => {
    if (selectedItems.length === 0) return;

    setBookingStep("confirm");
    setShowQrPayment(false);
    setPaymentType("deposit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSlotClass = (courtId, hour) => {
    const slotKey = `${courtId}-${hour}`;

    if (CLOSED_SLOTS.has(slotKey)) {
      return "bg-gray-200 text-gray-400 cursor-not-allowed";
    }

    if (BOOKED_SLOTS.has(slotKey)) {
      return "bg-red-500 text-white cursor-not-allowed";
    }

    if (selectedSlots.has(slotKey)) {
      return "bg-amber-300 text-amber-950 ring-2 ring-amber-500";
    }

    return "bg-white hover:bg-emerald-50 cursor-pointer";
  };

  if (bookingStep === "confirm") {
    return (
      <div className="min-h-screen bg-[#007a3d] font-sans text-white">
        <main className="mx-auto max-w-[1200px] px-3 py-4">
          <div className="mb-4 grid grid-cols-[40px_1fr_40px] items-center">
            <button
              type="button"
              onClick={() => {
                setBookingStep("select");
                setShowQrPayment(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <h1 className="text-center text-xl font-bold">Xác nhận đặt sân</h1>

            <div></div>
          </div>

          <section className="rounded-xl bg-[#006633] p-4">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-yellow-300">
              <i className="fa-solid fa-map"></i>
              Thông tin sân
            </h2>

            <div className="space-y-3 text-sm font-semibold">
              <p>
                Tên CLB: <span className="font-bold">Sân Cầu Lông Sunrise</span>
              </p>
              <p>Địa chỉ: 25 Nguyễn Xí, Phường 26, Bình Thạnh, TP.HCM</p>
            </div>
          </section>

          <section className="mt-4 rounded-xl bg-[#006633] p-4">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-yellow-300">
              <i className="fa-solid fa-scroll"></i>
              Thông tin lịch đặt
            </h2>

            <div className="space-y-3 text-sm font-semibold">
              <p>
                Ngày:{" "}
                <span className="font-bold">
                  {new Date(selectedDate).toLocaleDateString("vi-VN")}
                </span>
              </p>

              <div className="space-y-1">
                {selectedItems.map((item) => (
                  <p key={item.key}>
                    - {item.courtName}: {formatHour(item.hour)} -{" "}
                    {formatHour(item.hour + 1)} |{" "}
                    <span className="text-yellow-300">
                      {formatCurrency(item.price)}
                    </span>
                  </p>
                ))}
              </div>

              <p>Đối tượng: Cầu lông</p>
              <p>Tổng giờ: {totalHours}h</p>
              <p>Tổng tiền: {formatCurrency(totalPrice)}</p>
              <p>Tiền cọc 30%: {formatCurrency(deposit)}</p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentType("deposit");
                  setShowQrPayment(false);
                }}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
                  paymentType === "deposit"
                    ? "border-yellow-300 bg-yellow-300 text-green-950"
                    : "border-white/50 text-white hover:bg-white/10"
                }`}
              >
                Thanh toán cọc
                <div className="mt-1 text-xs font-semibold">
                  {formatCurrency(deposit)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentType("full");
                  setShowQrPayment(false);
                }}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
                  paymentType === "full"
                    ? "border-yellow-300 bg-yellow-300 text-green-950"
                    : "border-white/50 text-white hover:bg-white/10"
                }`}
              >
                Thanh toán toàn bộ
                <div className="mt-1 text-xs font-semibold">
                  {formatCurrency(totalPrice)}
                </div>
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-white/10 p-3 text-sm font-semibold">
              <div className="flex justify-between">
                <span>Số tiền thanh toán</span>
                <span className="text-yellow-300">
                  {formatCurrency(paymentAmount)}
                </span>
              </div>

              <div className="mt-2 flex justify-between">
                <span>Còn lại</span>
                <span className="text-yellow-300">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </section>

          <button
            type="button"
            className="mt-5 w-full rounded border border-white/70 py-3 text-sm font-bold hover:bg-white/10"
          >
            Thêm dịch vụ
          </button>

          <section className="mt-5 space-y-4">
            <label className="block text-sm font-bold uppercase">
              Tên của bạn
              <input
                type="text"
                defaultValue="nguyen van c"
                className="mt-2 w-full rounded-md border-0 bg-white px-4 py-3 text-sm text-green-900 outline-none"
              />
            </label>

            <label className="block text-sm font-bold uppercase">
              Số điện thoại
              <div className="mt-2 flex items-center rounded-md bg-white px-4 py-3 text-sm text-green-900">
                <span className="mr-3 rounded-full bg-red-600 px-2 py-1 text-xs text-white">
                  VN
                </span>
                <input
                  type="tel"
                  defaultValue="375476454"
                  className="flex-1 border-0 bg-transparent outline-none"
                />
              </div>
            </label>

            <label className="block text-sm font-bold uppercase">
              Ghi chú cho chủ sân
              <textarea
                placeholder="Nhập ghi chú"
                className="mt-2 h-20 w-full resize-none rounded-md border-0 bg-white px-4 py-3 text-sm text-green-900 outline-none"
              ></textarea>
            </label>
          </section>

          {showQrPayment && (
            <section className="mt-5 rounded-xl bg-white p-5 text-center text-green-900">
              <h2 className="text-lg font-bold">Quét QR để thanh toán</h2>

              <div className="mx-auto mt-4 grid h-52 w-52 grid-cols-6 grid-rows-6 gap-1 rounded-lg bg-white p-3 shadow-inner">
                {Array.from({ length: 36 }, (_, index) => (
                  <div
                    key={index}
                    className={`rounded-sm ${
                      [0, 1, 2, 6, 12, 30, 31, 35, 20, 21, 27, 28].includes(
                        index,
                      )
                        ? "bg-green-950"
                        : index % 3 === 0
                          ? "bg-green-700"
                          : "bg-green-100"
                    }`}
                  ></div>
                ))}
              </div>

              <p className="mt-3 text-sm">
                Nội dung: DAT SAN SUNRISE - {formatCurrency(paymentAmount)}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Hình QR hiện là giao diện mẫu, sau này thay bằng QR từ cổng
                thanh toán.
              </p>
            </section>
          )}

          <button
            type="button"
            onClick={() => setShowQrPayment(true)}
            className="mt-5 w-full rounded bg-yellow-400 px-4 py-4 text-sm font-bold uppercase text-white hover:bg-yellow-500"
          >
            {paymentType === "full"
              ? "Xác nhận & thanh toán toàn bộ"
              : "Xác nhận & thanh toán cọc"}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans text-gray-800">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] px-3 py-5 lg:px-4 lg:py-7">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative min-h-[260px] bg-gray-200 lg:min-h-[360px]">
              <img
                src={heroImage}
                alt="Sân cầu lông"
                className="h-full w-full object-cover"
              />

              <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                <i className="fa-solid fa-circle-check mr-1"></i>
                Còn sân hôm nay
              </div>
            </div>

            <div className="p-5 lg:p-7">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Quận Bình Thạnh
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  6 sân
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#0a192f] lg:text-3xl">
                Sân Cầu Lông Sunrise
              </h1>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-star w-4 text-amber-400"></i>
                  <span>
                    <strong className="text-gray-900">4.8</strong> từ 126 đánh
                    giá
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot w-4 text-blue-600"></i>
                  <span>25 Nguyễn Xí, Phường 26, Bình Thạnh, TP.HCM</span>
                </div>

                <div className="flex items-center gap-2">
                  <i className="fa-regular fa-clock w-4 text-blue-600"></i>
                  <span>Mở cửa 08:00 - 23:00</span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-600">
                Cơ sở có bãi xe, khu chờ, nước uống và phòng thay đồ. Bảng đặt
                sân bên dưới đang là mẫu tĩnh để kiểm tra trải nghiệm chọn giờ.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Từ</div>
                  <div className="text-sm font-bold text-[#0a192f]">
                    80.000đ/h
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Cọc</div>
                  <div className="text-sm font-bold text-[#0a192f]">30%</div>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">Loại sân</div>
                  <div className="text-sm font-bold text-[#0a192f]">3</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0a192f]">Đặt lịch</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Mỗi ô là một sân trong một khung 1 tiếng.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(true)}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  <i className="fa-solid fa-table-list mr-2"></i>
                  Xem bảng giá
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-sm border bg-white"></span>
                    Trống
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-sm bg-amber-300"></span>
                    Đang chọn
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-sm bg-red-500"></span>
                    Đã đặt
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-sm bg-gray-200"></span>
                    Khóa
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <div
                className="grid min-w-[980px]"
                style={{
                  gridTemplateColumns: `140px repeat(${HOURS.length}, minmax(54px, 1fr))`,
                }}
              >
                <div className="sticky left-0 z-20 border-b border-r border-gray-200 bg-[#f8fafc] px-3 py-3 text-xs font-bold text-gray-600">
                  Sân
                </div>

                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-r border-gray-200 bg-[#f8fafc] px-2 py-3 text-center text-xs font-bold text-gray-600"
                  >
                    {formatHour(hour)}
                  </div>
                ))}

                {COURTS.map((court) => (
                  <React.Fragment key={court.id}>
                    <div className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-3 py-3">
                      <div className="text-sm font-bold text-[#0a192f]">
                        {court.name}
                      </div>

                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {court.category}
                      </div>
                    </div>

                    {HOURS.map((hour) => (
                      <button
                        key={`${court.id}-${hour}`}
                        type="button"
                        onClick={() => toggleSlot(court.id, hour)}
                        className={`h-14 border-b border-r border-gray-200 text-[11px] font-semibold transition ${getSlotClass(
                          court.id,
                          hour,
                        )}`}
                        title={`${court.name} ${formatHour(hour)} - ${formatHour(
                          hour + 1,
                        )}`}
                      >
                        {selectedSlots.has(`${court.id}-${hour}`)
                          ? `${(getSlotPrice(hour) / 1000).toFixed(0)}k`
                          : ""}
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-max rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-[#0a192f]">Lịch đang chọn</h3>

            <div className="mt-4 space-y-3">
              {selectedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                  Chưa chọn khung giờ nào.
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#0a192f]">
                        {item.courtName}
                      </div>

                      <div className="text-xs text-gray-500">
                        {formatHour(item.hour)} - {formatHour(item.hour + 1)}
                      </div>
                    </div>

                    <div className="text-sm font-bold text-blue-600">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tổng số giờ</span>
                <strong className="text-[#0a192f]">{totalHours} giờ</strong>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền</span>
                <strong className="text-[#0a192f]">
                  {formatCurrency(totalPrice)}
                </strong>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Cọc dự kiến</span>
                <strong className="text-[#0a192f]">
                  {formatCurrency(deposit)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={goToConfirm}
              disabled={selectedItems.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fa-solid fa-arrow-right"></i>
              Tiếp theo
            </button>
          </aside>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0a192f]">Đánh giá</h2>
              <p className="mt-1 text-sm text-gray-500">
                Phản hồi mẫu từ người chơi sau khi đặt sân.
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-4 py-3 text-right">
              <div className="text-2xl font-bold text-[#0a192f]">
                4.8
                <i className="fa-solid fa-star ml-1 text-base text-amber-400"></i>
              </div>

              <div className="text-xs text-gray-500">126 đánh giá</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#0a192f]">{review.name}</h3>

                    <div className="mt-1 flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }, (_, index) => (
                        <i
                          key={index}
                          className={`fa-star text-xs ${
                            index < review.rating ? "fa-solid" : "fa-regular"
                          }`}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>

                <p className="text-sm leading-6 text-gray-600">
                  {review.content}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#0a192f]">Bảng giá</h2>
                <p className="text-sm text-gray-500">
                  Giá chung tham khảo theo khung giờ.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPriceModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[620px] border border-emerald-700 text-center text-sm text-emerald-950">
                <thead>
                  <tr className="font-bold">
                    <th className="border border-emerald-700 px-4 py-4">Thứ</th>
                    <th className="border border-emerald-700 px-4 py-4">
                      Khung giờ
                    </th>
                    <th className="border border-emerald-700 px-4 py-4">
                      Giá cố định
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {PRICE_TABLE.map((row, index) => (
                    <tr key={`${row.day}-${row.time}`}>
                      <td className="border border-emerald-700 px-4 py-4">
                        {index > 0 && PRICE_TABLE[index - 1].day === row.day
                          ? ""
                          : row.day}
                      </td>

                      <td className="border border-emerald-700 px-4 py-4">
                        {row.time}
                      </td>

                      <td className="border border-emerald-700 px-4 py-4">
                        {formatCurrency(row.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
