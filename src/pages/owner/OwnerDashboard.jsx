import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../api/axios";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const formatTime = (value) => String(value || "").slice(0, 5);

const getStatusLabel = (status) => {
  switch (Number(status)) {
    case 1:
      return "Đã xác nhận";
    case 2:
      return "Đã hủy";
    case 4:
      return "Hoàn thành";
    case 5:
      return "Đang khiếu nại";
    case 6:
      return "Đã hoàn tiền";
    default:
      return "Giữ chỗ";
  }
};

const getStatusClass = (status) => {
  switch (Number(status)) {
    case 1:
      return "bg-green-50 text-green-700 border border-green-200";
    case 2:
      return "bg-red-50 text-red-700 border border-red-200";
    case 4:
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case 5:
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case 6:
      return "bg-purple-50 text-purple-700 border border-purple-200";
    default:
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  }
};

export default function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/dashboard-chu-san");

        if (!ignore) {
          setDashboard(res.data?.data || {});
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Không thể tải dữ liệu dashboard chủ sân",
          );
          setDashboard(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const tongQuan = dashboard?.thong_ke_tong_quan || {};
  const lichHomNay = dashboard?.lich_hom_nay || [];

  const chartData = useMemo(() => {
    return (dashboard?.doanh_thu_theo_co_so_hom_nay || []).map((item) => ({
      co_so: item.ten_co_so,
      doanh_thu: Number(item.doanh_thu || 0),
      so_don: Number(item.so_don || 0),
    }));
  }, [dashboard]);

  const stats = [
    {
      label: "Doanh thu hôm nay",
      value: formatCurrency(tongQuan.tong_doanh_thu),
      icon: "fa-wallet",
      color: "text-green-600",
      bg: "bg-green-50",
      cardClass: "md:col-span-2 xl:col-span-2",
      valueClass: "text-3xl",
    },
    {
      label: "Đơn hôm nay",
      value: formatNumber(tongQuan.tong_don_dat_san),
      icon: "fa-calendar-check",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Đơn hủy hôm nay",
      value: formatNumber(tongQuan.tong_don_huy),
      icon: "fa-calendar-xmark",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Cơ sở hoạt động",
      value: formatNumber(tongQuan.tong_co_so_hoat_dong),
      icon: "fa-building",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Tổng quan hoạt động
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {"Số liệu hoạt động hôm nay của các cơ sở"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4 min-h-32 ${stat.cardClass || ""}`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shrink-0 ${stat.bg} ${stat.color}`}
            >
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-500 font-medium mb-1">
                {stat.label}
              </div>
              <div
                className={`${stat.valueClass || "text-2xl"} font-bold text-[#0a192f] leading-tight break-words`}
                title={stat.value}
              >
                {loading ? "..." : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-bold text-[#0a192f]">
              {"Doanh thu theo cơ sở hôm nay"}
            </h3>
            <span className="text-sm text-gray-500">
              Đơn hủy: {loading ? "..." : formatNumber(tongQuan.tong_don_huy)}
            </span>
          </div>

          <div className="h-[320px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="co_so"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) =>
                      Number(value) >= 1000000
                        ? `${Number(value) / 1000000}tr`
                        : formatNumber(value)
                    }
                    width={72}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 8px 24px rgb(15 23 42 / 0.12)",
                    }}
                  />
                  <Bar
                    dataKey="doanh_thu"
                    fill="#349DFF"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                {"Hôm nay chưa có doanh thu theo cơ sở"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-bold text-[#0a192f]">Lịch hôm nay</h3>
            <Link
              to="/chu-san/lich-dat"
              className="text-sm text-[#349DFF] font-medium hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
            {loading ? (
              <div className="text-sm text-gray-500 py-10 text-center">
                Đang tải lịch...
              </div>
            ) : lichHomNay.length > 0 ? (
              lichHomNay.map((booking) => (
                <div
                  key={`${booking.dat_san_id}-${booking.ten_san}-${booking.gio_bat_dau}`}
                  className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-[#0a192f] text-sm truncate">
                        {booking.ten_co_so} - {booking.ten_san}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <i className="fa-regular fa-clock mr-1"></i>
                        {formatTime(booking.gio_bat_dau)} -{" "}
                        {formatTime(booking.gio_ket_thuc)}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg shrink-0 ${getStatusClass(booking.trang_thai)}`}
                    >
                      {getStatusLabel(booking.trang_thai)}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    <div className="font-medium truncate">
                      {booking.ten_khach || "Khách hàng"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {booking.so_dien_thoai || "Chưa có số điện thoại"} ·{" "}
                      {formatCurrency(booking.gia)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-10 text-center">
                Hôm nay chưa có lịch đặt sân
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
