import { useEffect, useMemo, useState } from "react";
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
import { showToast } from "../../components/common/ToastMessage";

const today = () => new Date().toISOString().slice(0, 10);

const firstDayOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));
const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const formatChartLabel = (value, mode) => {
  if (!value) return "";
  if (mode === "thang") return `Tháng ${String(value).slice(5, 7)}`;
  if (mode === "tuan") return `Tuần ${String(value).slice(-2)}`;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
};

const paymentTypeLabel = (value) => {
  switch (Number(value)) {
    case 1:
      return "Cọc";
    case 2:
      return "Toàn bộ";
    case 3:
      return "Còn lại";
    default:
      return "Thanh toán";
  }
};

const paymentMethodLabel = (value) => {
  switch (String(value || "").toUpperCase()) {
    case "TAI_SAN":
      return "Tại sân";
    case "VNPAY":
      return "VNPAY";
    default:
      return value || "Chưa rõ";
  }
};

const withdrawStatus = (value) => {
  switch (Number(value)) {
    case 1:
      return {
        label: "Đã duyệt",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    case 2:
      return {
        label: "Từ chối",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    default:
      return {
        label: "Chờ duyệt",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      };
  }
};

const initialWithdrawForm = {
  so_tien: "",
  ngan_hang: "",
  so_tai_khoan: "",
  ten_chu_tai_khoan: "",
};

export default function RevenueReport() {
  const [filters, setFilters] = useState({
    tu_ngay: firstDayOfMonth(),
    den_ngay: today(),
    co_so_id: "",
    kieu: "ngay",
  });
  const [facilities, setFacilities] = useState([]);
  const [overview, setOverview] = useState({});
  const [chartRows, setChartRows] = useState([]);
  const [courtRows, setCourtRows] = useState([]);
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [withdrawRows, setWithdrawRows] = useState([]);
  const [withdrawBalance, setWithdrawBalance] = useState({});
  const [withdrawForm, setWithdrawForm] = useState(initialWithdrawForm);
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchFacilities = async () => {
      try {
        const res = await api.get("/co-so/cua-toi?trang_thai=1");
        if (!ignore) setFacilities(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!ignore) setFacilities([]);
      }
    };

    fetchFacilities();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchRevenue = async () => {
      setLoading(true);
      setError("");

      const params = {
        tu_ngay: filters.tu_ngay,
        den_ngay: filters.den_ngay,
        kieu: filters.kieu,
      };

      if (filters.co_so_id) {
        params.co_so_id = filters.co_so_id;
      }

      try {
        const [
          overviewRes,
          chartRes,
          courtRes,
          invoiceRes,
          withdrawRes,
          balanceRes,
        ] =
          await Promise.all([
            api.get("/chu-san/doanh-thu/tong-quan", { params }),
            api.get("/chu-san/doanh-thu/bieu-do", { params }),
            api.get("/chu-san/doanh-thu/theo-san", { params }),
            api.get("/chu-san/doanh-thu/hoa-don", { params }),
            api.get("/chu-san/doanh-thu/lich-su-rut-tien"),
            api.get("/chu-san/doanh-thu/so-du-rut-tien"),
          ]);

        if (ignore) return;

        setOverview(overviewRes.data?.data || {});
        setChartRows(chartRes.data?.data || []);
        setCourtRows(courtRes.data?.data || []);
        setInvoiceRows(chartRes.data?.data ? invoiceRes.data?.data || [] : []);
        setWithdrawRows(withdrawRes.data?.data || []);
        setWithdrawBalance(balanceRes.data?.data || {});
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Không thể tải báo cáo doanh thu",
          );
          setOverview({});
          setChartRows([]);
          setCourtRows([]);
          setInvoiceRows([]);
          setWithdrawBalance({});
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchRevenue();

    return () => {
      ignore = true;
    };
  }, [filters]);

  const chartData = useMemo(
    () =>
      chartRows.map((item) => ({
        label: formatChartLabel(item.thoi_gian, filters.kieu),
        doanh_thu: Number(item.doanh_thu || 0),
        so_don: Number(item.so_don || 0),
      })),
    [chartRows, filters.kieu],
  );

  const bestCourt = courtRows[0];
  const availableBalance = Number(withdrawBalance.so_du_kha_dung || 0);

  const stats = [
    {
      label: "Tổng doanh thu",
      value: formatCurrency(overview.tong_doanh_thu),
      icon: "fa-wallet",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Đơn thanh toán",
      value: formatNumber(overview.tong_don_thanh_toan),
      icon: "fa-receipt",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Tiền cọc",
      value: formatCurrency(overview.tong_tien_coc),
      icon: "fa-hand-holding-dollar",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Còn lại",
      value: formatCurrency(overview.tien_con_lai),
      icon: "fa-clock",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleWithdrawChange = (e) => {
    const { name, value } = e.target;
    setWithdrawForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submitWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawLoading(true);

    try {
      const res = await api.post("/chu-san/doanh-thu/rut-tien", withdrawForm);
      showToast(res.data?.message || "Tạo yêu cầu rút tiền thành công", "success");
      setWithdrawForm(initialWithdrawForm);

      const [historyRes, balanceRes] = await Promise.all([
        api.get("/chu-san/doanh-thu/lich-su-rut-tien"),
        api.get("/chu-san/doanh-thu/so-du-rut-tien"),
      ]);
      setWithdrawRows(historyRes.data?.data || []);
      setWithdrawBalance(balanceRes.data?.data || {});
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể tạo yêu cầu rút tiền",
        "error",
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Báo cáo doanh thu
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi doanh thu, hóa đơn và yêu cầu rút tiền
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="text-sm font-medium text-gray-600">
            <span className="block mb-1">Từ ngày</span>
            <input
              type="date"
              value={filters.tu_ngay}
              onChange={(e) => handleFilterChange("tu_ngay", e.target.value)}
              className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#349DFF]"
            />
          </label>

          <label className="text-sm font-medium text-gray-600">
            <span className="block mb-1">Đến ngày</span>
            <input
              type="date"
              value={filters.den_ngay}
              onChange={(e) => handleFilterChange("den_ngay", e.target.value)}
              className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#349DFF]"
            />
          </label>

          <label className="text-sm font-medium text-gray-600">
            <span className="block mb-1">Cơ sở</span>
            <select
              value={filters.co_so_id}
              onChange={(e) => handleFilterChange("co_so_id", e.target.value)}
              className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#349DFF]"
            >
              <option value="">Tất cả cơ sở</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.ten}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-gray-600">
            <span className="block mb-1">Biểu đồ</span>
            <select
              value={filters.kieu}
              onChange={(e) => handleFilterChange("kieu", e.target.value)}
              className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#349DFF]"
            >
              <option value="ngay">Theo ngày</option>
              <option value="tuan">Theo tuần</option>
              <option value="thang">Theo tháng</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4 min-h-32"
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
              <div className="text-2xl font-bold text-[#0a192f] break-words">
                {loading ? "..." : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0a192f]">
                Biểu đồ doanh thu
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(filters.tu_ngay)} - {formatDate(filters.den_ngay)}
              </p>
            </div>
          </div>

          <div className="h-[360px]">
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
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={8}
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
                    formatter={(value, name, item) => [
                      name === "doanh_thu"
                        ? formatCurrency(value)
                        : formatNumber(value),
                      name === "doanh_thu"
                        ? "Doanh thu"
                        : `Số đơn: ${formatNumber(item.payload.so_don)}`,
                    ]}
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
                Chưa có doanh thu trong khoảng ngày này
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0a192f] mb-6">
            Sân hiệu quả nhất
          </h3>

          {loading ? (
            <div className="text-sm text-gray-500 py-20 text-center">
              Đang tải dữ liệu...
            </div>
          ) : bestCourt ? (
            <div className="space-y-5">
              <div>
                <div className="text-sm text-gray-500 font-medium mb-1">
                  {bestCourt.ten_co_so}
                </div>
                <div className="text-2xl font-bold text-[#0a192f]">
                  {bestCourt.ten_san}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8fafc] rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Doanh thu
                  </div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(bestCourt.doanh_thu)}
                  </div>
                </div>
                <div className="bg-[#f8fafc] rounded-xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Lượt đặt
                  </div>
                  <div className="font-bold text-[#0a192f]">
                    {formatNumber(bestCourt.so_luot_dat)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[210px] overflow-auto pr-1">
                {courtRows.slice(0, 5).map((court) => (
                  <div
                    key={`${court.san_id}-${court.ten_co_so}`}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0a192f] truncate">
                        {court.ten_san}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {court.ten_co_so}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-green-600">
                        {formatCurrency(court.doanh_thu)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(court.so_luot_dat)} lượt
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-20 text-center">
              Chưa có dữ liệu theo sân
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#0a192f]">Hóa đơn</h3>
            <span className="text-sm text-gray-500">
              {loading ? "..." : `${formatNumber(invoiceRows.length)} giao dịch`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Mã GD</th>
                  <th className="px-6 py-4 whitespace-nowrap">Khách hàng</th>
                  <th className="px-6 py-4 whitespace-nowrap">Cơ sở</th>
                  <th className="px-6 py-4 whitespace-nowrap">Loại</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Đang tải hóa đơn...
                    </td>
                  </tr>
                ) : invoiceRows.length > 0 ? (
                  invoiceRows.slice(0, 10).map((invoice) => (
                    <tr key={invoice.thanh_toan_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {invoice.ma_giao_dich || `#${invoice.thanh_toan_id}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0a192f]">
                          {invoice.ten_khach}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.so_dien_thoai || "Chưa có SĐT"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {invoice.ten_co_so}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            {paymentTypeLabel(invoice.loai_thanh_toan)}
                          </span>
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                            {paymentMethodLabel(invoice.phuong_thuc)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">
                        {formatCurrency(invoice.so_tien)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {formatDate(invoice.ngay_thanh_toan)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Chưa có hóa đơn trong khoảng ngày này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-[#0a192f] mb-4">Rút tiền</h3>
          <div className="bg-[#f8fafc] rounded-xl p-4 mb-5">
            <div className="text-xs text-gray-500 font-medium mb-1">
              Doanh thu trong bộ lọc
            </div>
            <div className="text-xl font-bold text-green-600">
              {loading ? "..." : formatCurrency(availableBalance)}
            </div>
          </div>

          <form onSubmit={submitWithdraw} className="space-y-3">
            <input
              name="so_tien"
              type="number"
              min="1"
              value={withdrawForm.so_tien}
              onChange={handleWithdrawChange}
              placeholder="Số tiền rút"
              className="w-full h-10 px-3 rounded-xl border border-gray-200 outline-none focus:border-[#349DFF]"
              required
            />
            <input
              name="ngan_hang"
              value={withdrawForm.ngan_hang}
              onChange={handleWithdrawChange}
              placeholder="Ngân hàng"
              className="w-full h-10 px-3 rounded-xl border border-gray-200 outline-none focus:border-[#349DFF]"
              required
            />
            <input
              name="so_tai_khoan"
              value={withdrawForm.so_tai_khoan}
              onChange={handleWithdrawChange}
              placeholder="Số tài khoản"
              className="w-full h-10 px-3 rounded-xl border border-gray-200 outline-none focus:border-[#349DFF]"
              required
            />
            <input
              name="ten_chu_tai_khoan"
              value={withdrawForm.ten_chu_tai_khoan}
              onChange={handleWithdrawChange}
              placeholder="Tên chủ tài khoản"
              className="w-full h-10 px-3 rounded-xl border border-gray-200 outline-none focus:border-[#349DFF]"
              required
            />
            <button
              type="submit"
              disabled={withdrawLoading}
              className="w-full h-10 rounded-xl bg-[#349DFF] hover:bg-blue-600 disabled:opacity-70 text-white text-sm font-medium transition-colors"
            >
              {withdrawLoading ? "Đang gửi..." : "Tạo yêu cầu rút tiền"}
            </button>
          </form>

          <div className="mt-6">
            <div className="text-sm font-bold text-[#0a192f] mb-3">
              Lịch sử rút tiền
            </div>
            <div className="space-y-3 max-h-[260px] overflow-auto pr-1">
              {withdrawRows.length > 0 ? (
                withdrawRows.slice(0, 6).map((item) => {
                  const status = withdrawStatus(item.trang_thai);
                  return (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-[#0a192f]">
                            {formatCurrency(item.so_tien)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.ngan_hang} - {item.so_tai_khoan}
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(item.ngay_tao)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 py-8 text-center">
                  Chưa có yêu cầu rút tiền
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
