import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const today = () => new Date().toISOString().slice(0, 10);

const firstDayOfYear = () => {
  const date = new Date();
  return `${date.getFullYear()}-01-01`;
};

const numberFormatter = new Intl.NumberFormat("vi-VN");

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa có";

const formatMonth = (value) => {
  if (!value) return "";
  const [year, month] = String(value).split("-");
  return month && year ? `${month}/${year}` : value;
};

const getStatusLabel = (status, type = "default") => {
  const value = Number(status);

  if (type === "facilityApproval") {
    if (value === 0) return "Chờ duyệt";
    if (value === 1) return "Đã duyệt";
    if (value === 2) return "Từ chối";
  }

  if (value === 0) return "Chờ xử lý";
  if (value === 1) return "Đã xử lý";
  if (value === 2) return "Từ chối";
  return "Chưa có";
};

const badgeClass = (status) => {
  switch (Number(status)) {
    case 0:
      return "border-amber-200 bg-amber-50 text-amber-700";
    case 1:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case 2:
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export default function AdminDashboard() {
  const [filters, setFilters] = useState({
    tu_ngay: firstDayOfYear(),
    den_ngay: today(),
  });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    if (filters.tu_ngay && filters.den_ngay && filters.tu_ngay > filters.den_ngay) {
      showToast("Từ ngày không được lớn hơn đến ngày", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard", { params: filters });
      setDashboard(res.data?.data || {});
    } catch (error) {
      showToast(
        error.response?.data?.message || "Không thể tải dashboard admin",
        "error",
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const tongQuan = dashboard?.tong_quan || {};
  const coSoStatus = dashboard?.thong_ke_co_so_theo_trang_thai || {};

  const userChartData = useMemo(
    () =>
      (dashboard?.thong_ke_nguoi_dung_theo_thang || []).map((item) => ({
        thang: formatMonth(item.thang),
        nguoi_dung: Number(item.so_luong_nguoi_dung_moi || 0),
      })),
    [dashboard],
  );

  const bookingChartData = useMemo(
    () =>
      (dashboard?.thong_ke_don_dat_theo_thang || []).map((item) => ({
        thang: formatMonth(item.thang),
        tong_don: Number(item.tong_don || 0),
        hoan_thanh: Number(item.don_hoan_thanh || 0),
        da_huy: Number(item.don_huy || 0),
      })),
    [dashboard],
  );

  const stats = [
    {
      label: "Người dùng",
      value: tongQuan.tong_nguoi_dung,
      hint: `${formatNumber(tongQuan.tong_khach_hang)} khách · ${formatNumber(
        tongQuan.tong_chu_san,
      )} chủ sân`,
      icon: "fa-users",
      color: "text-blue-600",
      bg: "bg-blue-50",
      to: "/admin/nguoi-dung",
    },
    {
      label: "Cơ sở",
      value: tongQuan.tong_co_so,
      hint: `${formatNumber(tongQuan.co_so_cho_duyet)} chờ duyệt`,
      icon: "fa-building",
      color: "text-violet-600",
      bg: "bg-violet-50",
      to: "/admin/co-so",
    },
    {
      label: "Đơn đặt sân",
      value: tongQuan.tong_don_dat,
      hint: `${formatNumber(tongQuan.tong_don_hoan_thanh)} hoàn thành · ${formatNumber(
        tongQuan.tong_don_huy,
      )} hủy`,
      icon: "fa-calendar-check",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      to: "/admin/tong-quan",
    },
    {
      label: "Tài khoản bị khóa",
      value: tongQuan.tai_khoan_bi_khoa,
      hint: "Cần theo dõi rủi ro hệ thống",
      icon: "fa-user-lock",
      color: "text-rose-600",
      bg: "bg-rose-50",
      to: "/admin/nguoi-dung",
    },
  ];

  const pendingItems = [
    {
      label: "Cơ sở chờ duyệt",
      value: tongQuan.co_so_cho_duyet,
      icon: "fa-building-circle-check",
      to: "/admin/duyet-co-so",
    },
    {
      label: "Khuyến mãi chờ duyệt",
      value: tongQuan.khuyen_mai_cho_duyet,
      icon: "fa-ticket",
      to: "/admin/khuyen-mai",
    },
    {
      label: "Khiếu nại chờ xử lý",
      value: tongQuan.khieu_nai_cho_xu_ly,
      icon: "fa-flag",
      to: "/admin/khieu-nai",
    },
    {
      label: "Hoàn tiền chờ xử lý",
      value: tongQuan.hoan_tien_cho_duyet,
      icon: "fa-money-bill-wave",
      to: "/admin/khieu-nai",
    },
    {
      label: "Rút tiền chờ duyệt",
      value: tongQuan.rut_tien_cho_duyet,
      icon: "fa-money-bill-transfer",
      to: "/admin/rut-tien",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0a192f]">
            Tổng quan hệ thống
          </h2>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-end">
          <DateInput
            label="Từ ngày"
            value={filters.tu_ngay}
            onChange={(value) =>
              setFilters((current) => ({ ...current, tu_ngay: value }))
            }
          />
          <DateInput
            label="Đến ngày"
            value={filters.den_ngay}
            onChange={(value) =>
              setFilters((current) => ({ ...current, den_ngay: value }))
            }
          />
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#349DFF] px-4 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <i
              className={`fa-solid ${loading ? "fa-circle-notch fa-spin" : "fa-rotate-right"}`}
            ></i>
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} loading={loading} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#0a192f]">
                Đơn đặt theo tháng
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Tổng đơn, đơn hoàn thành và đơn hủy trong khoảng ngày.
              </p>
            </div>
          </div>

          <ChartBox loading={loading} empty={bookingChartData.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="thang" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Bar dataKey="tong_don" name="Tổng đơn" fill="#349DFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="hoan_thanh" name="Hoàn thành" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="da_huy" name="Đã hủy" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-[#0a192f]">
            Việc cần xử lý
          </h3>
          <div className="mt-4 space-y-3">
            {pendingItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#349DFF]">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className="text-xl font-extrabold text-[#0a192f]">
                  {loading ? "..." : formatNumber(item.value)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-[#0a192f]">
            Người dùng mới
          </h3>
          <ChartBox loading={loading} empty={userChartData.length === 0} small>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="thang" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Line
                  type="monotone"
                  dataKey="nguoi_dung"
                  name="Người dùng mới"
                  stroke="#349DFF"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-[#0a192f]">
            Trạng thái cơ sở
          </h3>
          <div className="mt-4 space-y-3">
            <ProgressRow
              label="Đang hoạt động"
              value={coSoStatus.dang_hoat_dong}
              total={coSoStatus.tong_co_so}
              color="bg-emerald-500"
              loading={loading}
            />
            <ProgressRow
              label="Bị khóa"
              value={coSoStatus.bi_khoa}
              total={coSoStatus.tong_co_so}
              color="bg-rose-500"
              loading={loading}
            />
            <ProgressRow
              label="Chờ duyệt"
              value={coSoStatus.cho_duyet}
              total={coSoStatus.tong_co_so}
              color="bg-amber-500"
              loading={loading}
            />
            <ProgressRow
              label="Đã duyệt"
              value={coSoStatus.da_duyet}
              total={coSoStatus.tong_co_so}
              color="bg-blue-500"
              loading={loading}
            />
          </div>
        </section>

        <RecentList
          title="Cơ sở mới đăng ký"
          empty="Chưa có cơ sở mới"
          items={dashboard?.co_so_moi_dang_ky || []}
          loading={loading}
          render={(item) => (
            <RecentItem
              title={item.ten}
              meta={item.ten_chu_san || item.email}
              date={item.ngay_tao}
              status={getStatusLabel(item.trang_thai_duyet, "facilityApproval")}
              statusClass={badgeClass(item.trang_thai_duyet)}
            />
          )}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RecentList
          title="Khiếu nại mới nhất"
          empty="Chưa có khiếu nại"
          items={dashboard?.khieu_nai_moi_nhat || []}
          loading={loading}
          render={(item) => (
            <RecentItem
              title={item.tieu_de || item.ly_do || `Đơn #${item.dat_san_id}`}
              meta={item.ten_nguoi_gui || "Khách hàng"}
              date={item.ngay_tao}
              status={getStatusLabel(item.trang_thai)}
              statusClass={badgeClass(item.trang_thai)}
            />
          )}
        />

        <RecentList
          title="Yêu cầu rút tiền"
          empty="Chưa có yêu cầu rút tiền"
          items={dashboard?.rut_tien_moi_nhat || []}
          loading={loading}
          render={(item) => (
            <RecentItem
              title={formatNumber(item.so_tien) + "đ"}
              meta={`${item.ten_chu_san || "Chủ sân"} · ${item.ngan_hang || ""}`}
              date={item.ngay_tao}
              status={getStatusLabel(item.trang_thai)}
              statusClass={badgeClass(item.trang_thai)}
            />
          )}
        />

        <RecentList
          title="Nhật ký hệ thống"
          empty="Chưa có nhật ký"
          items={dashboard?.system_logs_moi_nhat || []}
          loading={loading}
          render={(item) => (
            <RecentItem
              title={item.hanh_dong}
              meta={item.ten_nguoi_dung || item.ip_address || "Hệ thống"}
              date={item.ngay_tao}
              status="Log"
              statusClass="border-slate-200 bg-slate-50 text-slate-600"
            />
          )}
        />
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <label className="text-xs font-bold uppercase text-gray-500">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-[#0a192f] outline-none focus:border-[#349DFF]"
      />
    </label>
  );
}

function StatCard({ stat, loading }) {
  return (
    <Link
      to={stat.to}
      className="flex min-h-32 items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl ${stat.bg} ${stat.color}`}
      >
        <i className={`fa-solid ${stat.icon}`}></i>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-gray-500">{stat.label}</div>
        <div className="mt-1 text-2xl font-extrabold text-[#0a192f]">
          {loading ? "..." : formatNumber(stat.value)}
        </div>
        <div className="mt-1 line-clamp-2 text-xs font-medium text-gray-500">
          {loading ? "Đang tải..." : stat.hint}
        </div>
      </div>
    </Link>
  );
}

function ChartBox({ children, loading, empty, small = false }) {
  const height = small ? "h-[260px]" : "h-[340px]";

  if (loading) {
    return (
      <div className={`${height} flex items-center justify-center text-sm font-bold text-gray-500`}>
        <i className="fa-solid fa-circle-notch fa-spin mr-2 text-[#349DFF]"></i>
        Đang tải dữ liệu...
      </div>
    );
  }

  if (empty) {
    return (
      <div className={`${height} flex items-center justify-center text-sm font-bold text-gray-400`}>
        Chưa có dữ liệu trong khoảng ngày này
      </div>
    );
  }

  return <div className={height}>{children}</div>;
}

function ProgressRow({ label, value, total, color, loading }) {
  const safeTotal = Number(total || 0);
  const safeValue = Number(value || 0);
  const percent = safeTotal > 0 ? Math.round((safeValue / safeTotal) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-gray-700">{label}</span>
        <span className="font-extrabold text-[#0a192f]">
          {loading ? "..." : formatNumber(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${loading ? 0 : percent}%` }}
        />
      </div>
    </div>
  );
}

function RecentList({ title, empty, items, loading, render }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-extrabold text-[#0a192f]">{title}</h3>
      <div className="mt-4 max-h-[360px] space-y-3 overflow-auto pr-1">
        {loading ? (
          <div className="py-10 text-center text-sm font-bold text-gray-500">
            <i className="fa-solid fa-circle-notch fa-spin mr-2 text-[#349DFF]"></i>
            Đang tải...
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm font-bold text-gray-400">
            {empty}
          </div>
        ) : (
          items.map((item) => <div key={item.id}>{render(item)}</div>)
        )}
      </div>
    </section>
  );
}

function RecentItem({ title, meta, date, status, statusClass }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-[#0a192f]">
            {title || "Chưa có"}
          </div>
          <div className="mt-1 truncate text-xs font-medium text-gray-500">
            {meta || "Chưa có"}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
        >
          {status}
        </span>
      </div>
      <div className="mt-3 text-xs font-medium text-gray-400">
        {formatDateTime(date)}
      </div>
    </div>
  );
}
