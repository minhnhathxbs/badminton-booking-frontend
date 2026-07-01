import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const TXT = {
  title: "Lịch đặt sân",
  desc: "Theo dõi các đơn đặt sân tại cơ sở của bạn theo ngày.",
  today: "Hôm nay",
  allFacilities: "Tất cả cơ sở",
  allStatus: "Tất cả trạng thái",
  search: "Tìm theo khách, SĐT, email, cơ sở hoặc mã đơn",
  reload: "Tải lại",
  loading: "Đang tải lịch đặt sân...",
  empty: "Chưa có lịch đặt sân trong ngày này",
  customer: "Khách hàng",
  facility: "Cơ sở",
  booking: "Đơn",
  court: "Sân",
  time: "Thời gian",
  payment: "Thanh toán",
  total: "Thành tiền",
  status: "Trạng thái",
  createdAt: "Ngày tạo",
  detail: "Chi tiết đơn",
  close: "Đóng",
  noData: "Chưa có",
};

const STATUS_OPTIONS = [
  { value: "", label: TXT.allStatus },
  { value: "0", label: "Giữ chỗ" },
  { value: "1", label: "Đã đặt" },
  { value: "2", label: "Đã hủy" },
  { value: "4", label: "Hoàn thành" },
  { value: "5", label: "Đang khiếu nại" },
  { value: "6", label: "Đã hoàn tiền" },
];

const formatInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayValue = () => formatInputDate(new Date());

const addDays = (dateValue, days) => {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : TXT.noData;

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : TXT.noData;

const getLocalDateKey = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return formatInputDate(date);
  }

  return String(value).slice(0, 10);
};

const getSlotInfo = (status) => {
  switch (status) {
    case "trong":
      return {
        label: "Trống",
        icon: "fa-circle-check",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      };
    case "giu_cho":
      return {
        label: "Giữ chỗ",
        icon: "fa-clock",
        className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
      };
    case "da_dat":
      return {
        label: "Đã đặt",
        icon: "fa-calendar-check",
        className: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      };
    case "da_dat_qua_gio":
      return {
        label: "Đã đặt",
        icon: "fa-calendar-check",
        className: "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
      };
    case "qua_gio":
      return {
        label: "Qua giờ",
        icon: "fa-circle-minus",
        className: "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100",
      };
    case "khong_co_gia":
      return {
        label: "Chưa có giá",
        icon: "fa-tag",
        className: "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
      };
    default:
      return {
        label: TXT.noData,
        icon: "fa-circle-question",
        className: "border-gray-200 bg-white text-gray-500",
      };
  }
};

const getStatusInfo = (bookingOrStatus) => {
  const booking =
    typeof bookingOrStatus === "object" && bookingOrStatus !== null
      ? bookingOrStatus
      : null;
  const status = Number(booking ? booking.trang_thai : bookingOrStatus);
  const isExpiredHold =
    booking &&
    status === 2 &&
    Number(booking.da_thanh_toan || 0) === 0 &&
    String(booking.ly_do_huy || "").toLowerCase().includes("hết hạn");

  switch (status) {
    case 0:
      return {
        label: "Giữ chỗ",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        blockClass: "border-amber-300 bg-amber-100 text-amber-900",
      };
    case 1:
      return {
        label: "Đã đặt",
        className: "border-blue-200 bg-blue-50 text-blue-700",
        blockClass: "border-blue-500 bg-blue-600 text-white",
      };
    case 2:
      return {
        label: isExpiredHold ? "Hết hạn giữ chỗ" : "Đã hủy",
        className: "border-rose-200 bg-rose-50 text-rose-700",
        blockClass: "border-rose-300 bg-rose-100 text-rose-800",
      };
    case 4:
      return {
        label: "Hoàn thành",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        blockClass: "border-emerald-500 bg-emerald-600 text-white",
      };
    case 5:
      return {
        label: "Đang khiếu nại",
        className: "border-orange-200 bg-orange-50 text-orange-700",
        blockClass: "border-orange-300 bg-orange-100 text-orange-800",
      };
    case 6:
      return {
        label: "Đã hoàn tiền",
        className: "border-purple-200 bg-purple-50 text-purple-700",
        blockClass: "border-purple-300 bg-purple-100 text-purple-800",
      };
    default:
      return {
        label: TXT.noData,
        className: "border-slate-200 bg-slate-50 text-slate-600",
        blockClass: "border-slate-300 bg-slate-100 text-slate-700",
      };
  }
};

export default function ManageBookings() {
  const [selectedDate, setSelectedDate] = useState(todayValue());
  const [status, setStatus] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await api.get("/co-so/cua-toi?trang_thai=1");
      setFacilities(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Không thể tải danh sách cơ sở",
        "error",
      );
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        tu_ngay: selectedDate,
        den_ngay: selectedDate,
        gioi_han: 100,
      };

      if (status !== "") params.trang_thai = status;
      if (facilityId !== "") params.co_so_id = facilityId;
      if (keyword.trim()) params.tu_khoa = keyword.trim();

      const res = await api.get("/chu-san/lich-dat", { params });
      setBookings(res.data?.data || []);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Không thể tải lịch đặt sân",
        "error",
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [facilityId, keyword, selectedDate, status]);

  const fetchSchedule = useCallback(async () => {
    if (!facilityId) {
      setSchedule(null);
      setScheduleError("");
      return;
    }

    if (selectedDate < todayValue()) {
      setSchedule(null);
      setScheduleError("Tình trạng sân chỉ hỗ trợ từ hôm nay trở đi.");
      return;
    }

    setScheduleLoading(true);
    setScheduleError("");
    try {
      const res = await api.get("/dat-san/lich", {
        params: { co_so_id: facilityId, ngay: selectedDate },
      });
      setSchedule(res.data || null);
    } catch (error) {
      setSchedule(null);
      setScheduleError(
        error.response?.data?.message || "Không thể tải tình trạng sân",
      );
    } finally {
      setScheduleLoading(false);
    }
  }, [facilityId, selectedDate]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const stats = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        acc.revenue += Number(booking.da_thanh_toan || 0);
        if (Number(booking.trang_thai) === 1) acc.active += 1;
        if (Number(booking.trang_thai) === 4) acc.completed += 1;
        return acc;
      },
      { total: 0, active: 0, completed: 0, revenue: 0 },
    );
  }, [bookings]);

  const selectedFacilityName = useMemo(() => {
    return facilities.find((facility) => String(facility.id) === String(facilityId))
      ?.ten;
  }, [facilities, facilityId]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">{TXT.title}</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">{TXT.desc}</p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") fetchBookings();
              }}
              placeholder={TXT.search}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm font-medium outline-none focus:border-[#349DFF] xl:w-80"
            />
          </div>

          <select
            value={facilityId}
            onChange={(event) => setFacilityId(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#349DFF]"
          >
            <option value="">{TXT.allFacilities}</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.ten}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#349DFF]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon="fa-calendar-check" label="Tổng đơn" value={stats.total} />
        <StatCard icon="fa-circle-check" label="Đang đặt" value={stats.active} />
        <StatCard icon="fa-flag-checkered" label="Hoàn thành" value={stats.completed} />
        <StatCard
          icon="fa-money-bill-wave"
          label="Đã thanh toán"
          value={formatCurrency(stats.revenue)}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(todayValue())}
            className="h-10 rounded-xl bg-blue-50 px-4 text-sm font-bold text-[#349DFF] hover:bg-blue-100"
          >
            {TXT.today}
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate((value) => addDays(value, -1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
            title="Ngày trước"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#349DFF]"
          />
          <button
            type="button"
            onClick={() => setSelectedDate((value) => addDays(value, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
            title="Ngày sau"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#349DFF] px-4 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <i
            className={`fa-solid ${loading ? "fa-circle-notch fa-spin" : "fa-rotate-right"}`}
          ></i>
          {TXT.reload}
        </button>
      </div>

      <ScheduleGrid
        facilityId={facilityId}
        facilityName={selectedFacilityName}
        selectedDate={selectedDate}
        schedule={schedule}
        bookings={bookings}
        loading={scheduleLoading}
        error={scheduleError}
      />

      <BookingTable
        bookings={bookings}
        loading={loading}
        onSelect={setSelectedBooking}
      />

      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

function ScheduleGrid({
  facilityId,
  facilityName,
  selectedDate,
  schedule,
  bookings,
  loading,
  error,
}) {
  const timeSlots = schedule?.khung_gio || [];
  const courts = schedule?.san || [];
  const bookingSlotMap = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      (booking.chi_tiet || []).forEach((detail) => {
        const key = [
          Number(detail.san_id),
          Number(detail.khung_gio_mau_id),
          getLocalDateKey(detail.ngay),
        ].join("-");

        if (!map.has(key)) {
          map.set(key, booking);
        }
      });
    });

    return map;
  }, [bookings]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-extrabold uppercase text-gray-500">
            Tình trạng sân trong ngày
          </h3>
          <p className="mt-1 text-sm font-bold text-[#0a192f]">
            {facilityName || "Chọn một cơ sở để xem sân trống/đã đặt"}
          </p>
        </div>
        <div className="text-xs font-bold text-gray-500">
          {formatDate(selectedDate)}
        </div>
      </div>

      {!facilityId ? (
        <EmptyState
          icon="fa-building-circle-exclamation"
          text="Chọn cơ sở để xem tình trạng từng sân"
        />
      ) : loading ? (
        <EmptyState icon="fa-circle-notch fa-spin" text="Đang tải tình trạng sân..." />
      ) : error ? (
        <EmptyState icon="fa-circle-exclamation" text={error} />
      ) : courts.length === 0 || timeSlots.length === 0 ? (
        <EmptyState icon="fa-calendar-xmark" text="Chưa có dữ liệu sân trong ngày này" />
      ) : (
        <div className="overflow-auto">
          <div className="min-w-[980px] space-y-4 p-4">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {[
                ["trong", "Trống"],
                ["da_dat", "Đã đặt"],
                ["giu_cho", "Giữ chỗ"],
                ["qua_gio", "Qua giờ"],
              ].map(([statusValue, label]) => {
                const info = getSlotInfo(statusValue);
                return (
                  <span
                    key={statusValue}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${info.className}`}
                  >
                    <i className={`fa-solid ${info.icon} text-[10px]`}></i>
                    {label}
                  </span>
                );
              })}
            </div>

            {courts.map((court) => (
              <section
                key={court.id}
                className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0a192f]">
                      {court.ten}
                    </h4>
                    <p className="mt-0.5 text-xs font-bold text-gray-500">
                      {court.ten_danh_muc || "Sân cầu lông"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-gray-500">
                    {court.slots?.length || 0} khung giờ
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {timeSlots.map((timeSlot) => {
                    const slot = court.slots?.find(
                      (item) =>
                        Number(item.khung_gio_mau_id) === Number(timeSlot.id),
                    );
                    const info = getSlotInfo(slot?.trang_thai);
                    const booking = bookingSlotMap.get(
                      [Number(court.id), Number(timeSlot.id), selectedDate].join("-"),
                    );

                    return (
                      <div
                        key={`${court.id}-${timeSlot.id}`}
                        className="group relative"
                      >
                        <div
                          className={`min-h-[76px] rounded-xl border bg-white p-3 transition ${info.className}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black">
                              {timeSlot.gio_bat_dau} - {timeSlot.gio_ket_thuc}
                            </span>
                            <i className={`fa-solid ${info.icon} text-xs`}></i>
                          </div>
                          <div className="mt-3 text-sm font-black">{info.label}</div>
                          {booking && (
                            <div className="mt-1 truncate text-[11px] font-bold opacity-80">
                              #{booking.id} · {booking.khach_hang?.ho_ten || TXT.noData}
                            </div>
                          )}
                        </div>

                        {booking && (
                          <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-xl group-hover:block">
                            <div className="font-black text-[#0a192f]">
                              Đơn #{booking.id}
                            </div>
                            <div className="mt-2 space-y-1 font-semibold text-gray-600">
                              <div>
                                Khách:{" "}
                                <span className="font-bold text-gray-900">
                                  {booking.khach_hang?.ho_ten || TXT.noData}
                                </span>
                              </div>
                              <div>
                                SĐT:{" "}
                                <span className="font-bold text-gray-900">
                                  {booking.khach_hang?.so_dien_thoai || TXT.noData}
                                </span>
                              </div>
                              <div>
                                Thanh toán:{" "}
                                <span className="font-bold text-gray-900">
                                  {formatCurrency(booking.da_thanh_toan)}
                                </span>
                              </div>
                              <div>
                                Trạng thái:{" "}
                                <span className="font-bold text-gray-900">
                                  {getStatusInfo(booking).label}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingTable({ bookings, loading, onSelect }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-xs font-bold uppercase text-gray-500">
            <tr>
              <Th>{TXT.booking}</Th>
              <Th>{TXT.customer}</Th>
              <Th>{TXT.facility}</Th>
              <Th>{TXT.time}</Th>
              <Th>{TXT.payment}</Th>
              <Th>{TXT.total}</Th>
              <Th>{TXT.status}</Th>
              <Th>{TXT.createdAt}</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState icon="fa-circle-notch fa-spin" text={TXT.loading} />
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState icon="fa-calendar-xmark" text={TXT.empty} />
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const statusInfo = getStatusInfo(booking);
                const firstDetail = booking.chi_tiet?.[0];
                const detailCount = booking.chi_tiet?.length || 0;

                return (
                  <tr key={booking.id} className="hover:bg-gray-50/70">
                    <Td strong>#{booking.id}</Td>
                    <Td strong>
                      <div>{booking.khach_hang?.ho_ten || TXT.noData}</div>
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        {booking.khach_hang?.so_dien_thoai ||
                          booking.khach_hang?.email ||
                          TXT.noData}
                      </div>
                    </Td>
                    <Td>{booking.co_so?.ten || TXT.noData}</Td>
                    <Td>
                      {firstDetail ? (
                        <>
                          <div>{formatDate(firstDetail.ngay)}</div>
                          <div className="mt-1 text-xs font-bold text-gray-500">
                            {firstDetail.gio_bat_dau} - {firstDetail.gio_ket_thuc}
                            {detailCount > 1 ? ` · ${detailCount} khung` : ""}
                          </div>
                        </>
                      ) : (
                        TXT.noData
                      )}
                    </Td>
                    <Td>
                      <div>{formatCurrency(booking.da_thanh_toan)}</div>
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        Còn lại {formatCurrency(booking.con_lai)}
                      </div>
                    </Td>
                    <Td strong>{formatCurrency(booking.thanh_tien)}</Td>
                    <Td>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </Td>
                    <Td>{formatDateTime(booking.ngay_tao)}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => onSelect(booking)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        title={TXT.detail}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingDetail({ booking, onClose }) {
  const statusInfo = getStatusInfo(booking);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#0a192f]">
              {TXT.detail} #{booking.id}
            </h3>
            <p className="mt-1 text-sm font-bold text-[#349DFF]">
              {booking.co_so?.ten || TXT.noData}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            aria-label={TXT.close}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <section className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
            <InfoLine label={TXT.customer} value={booking.khach_hang?.ho_ten} />
            <InfoLine
              label="SĐT"
              value={booking.khach_hang?.so_dien_thoai}
            />
            <InfoLine label="Email" value={booking.khach_hang?.email} />
            <div>
              <div className="text-xs font-bold uppercase text-gray-500">
                {TXT.status}
              </div>
              <span
                className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-3">
            <InfoLine label="Tổng tiền" value={formatCurrency(booking.tong_tien)} />
            <InfoLine label="Giảm giá" value={formatCurrency(booking.tien_giam)} />
            <InfoLine
              label="Thành tiền"
              value={formatCurrency(booking.thanh_tien)}
            />
            <InfoLine
              label="Tiền cọc"
              value={formatCurrency(booking.tien_coc)}
            />
            <InfoLine
              label="Đã thanh toán"
              value={formatCurrency(booking.da_thanh_toan)}
            />
            <InfoLine label="Còn lại" value={formatCurrency(booking.con_lai)} />
          </section>

          <section className="rounded-2xl border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-3 text-xs font-bold uppercase text-gray-500">
              Chi tiết sân
            </div>
            <div className="divide-y divide-gray-100">
              {(booking.chi_tiet || []).map((item) => (
                <div
                  key={`${item.san_id}-${item.khung_gio_mau_id}-${item.ngay}`}
                  className="grid gap-2 px-4 py-3 text-sm font-medium text-gray-700 sm:grid-cols-4"
                >
                  <div className="font-bold text-[#0a192f]">{item.ten_san}</div>
                  <div>{formatDate(item.ngay)}</div>
                  <div>
                    {item.gio_bat_dau} - {item.gio_ket_thuc}
                  </div>
                  <div className="font-bold">{formatCurrency(item.gia)}</div>
                </div>
              ))}
            </div>
          </section>

          {booking.ghi_chu && (
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <InfoLine label="Ghi chú" value={booking.ghi_chu} />
            </section>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            {TXT.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#349DFF]">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <div className="text-xs font-bold uppercase text-gray-500">{label}</div>
        <div className="mt-1 text-xl font-extrabold text-[#0a192f]">
          {value}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-sm font-bold text-gray-500">
        <i className={`fa-solid ${icon} text-3xl text-[#349DFF]`}></i>
        {text}
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
        strong ? "font-extrabold text-[#0a192f]" : "font-medium text-gray-600"
      }`}
    >
      <div className="line-clamp-3">{children}</div>
    </td>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-gray-500">{label}</div>
      <div className="mt-1 break-words text-sm font-bold text-[#0a192f]">
        {value || TXT.noData}
      </div>
    </div>
  );
}
