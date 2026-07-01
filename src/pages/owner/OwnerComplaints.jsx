import { useEffect, useMemo, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const TXT = {
  title: "Danh sách khiếu nại từ khách hàng",
  desc: "Theo dõi các khiếu nại từ khách hàng đối với cơ sở của bạn.",
  all: "Tất cả trạng thái",
  pending: "Chờ xử lý",
  accepted: "Đã chấp nhận",
  rejected: "Đã từ chối",
  search: "Tìm theo khách hàng, SĐT, cơ sở hoặc lý do",
  loading: "Đang tải khiếu nại...",
  empty: "Chưa có khiếu nại nào",
  customer: "Khách hàng",
  facility: "Cơ sở",
  booking: "Đơn",
  amount: "Số tiền",
  reason: "Lý do khiếu nại",
  evidence: "Hình ảnh chứng minh",
  status: "Trạng thái",
  createdAt: "Ngày gửi",
  action: "Thao tác",
  close: "Đóng",
  noData: "Chưa có",
  viewDetail: "Xem chi tiết",
  detailTitle: "Chi tiết khiếu nại",
  phone: "SĐT",
  adminNote: "Ghi chú Admin",
  processedAt: "Ngày xử lý",
  totalComplaints: "Tổng khiếu nại",
  pendingCount: "Chờ xử lý",
  resolvedCount: "Đã xử lý",
  loadFail: "Không thể tải danh sách khiếu nại",
  contactAdmin: "Liên hệ Admin",
  contactHint: "Nếu khiếu nại không hợp lý, vui lòng liên hệ hotline Admin để giải trình và cung cấp minh chứng.",
};

const STATUS_OPTIONS = [
  { value: "", label: TXT.all },
  { value: "0", label: TXT.pending },
  { value: "1", label: TXT.accepted },
  { value: "2", label: TXT.rejected },
];

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : TXT.noData;

const getStatusInfo = (status) => {
  switch (Number(status)) {
    case 0:
      return {
        label: TXT.pending,
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case 1:
      return {
        label: TXT.accepted,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case 2:
      return {
        label: TXT.rejected,
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
    default:
      return {
        label: TXT.noData,
        className: "border-slate-200 bg-slate-50 text-slate-600",
      };
  }
};

export default function OwnerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get("/khieu-nai/chu-san");
      setComplaints(res.data?.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || TXT.loadFail, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, []);

  const filtered = useMemo(() => {
    let result = complaints;

    if (status !== "") {
      result = result.filter(
        (item) => String(item.trang_thai) === status,
      );
    }

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (item) =>
          (item.khach_hang?.ho_ten || "").toLowerCase().includes(kw) ||
          (item.khach_hang?.so_dien_thoai || "").toLowerCase().includes(kw) ||
          (item.ten_co_so || "").toLowerCase().includes(kw) ||
          (item.ly_do || "").toLowerCase().includes(kw),
      );
    }

    return result;
  }, [complaints, status, keyword]);

  const stats = useMemo(() => {
    return complaints.reduce(
      (acc, item) => {
        acc.total += 1;
        if (Number(item.trang_thai) === 0) {
          acc.pending += 1;
        } else {
          acc.resolved += 1;
        }
        return acc;
      },
      { total: 0, pending: 0, resolved: 0 },
    );
  }, [complaints]);

  const imageList = (raw) => {
    if (!raw) return [];
    return String(raw).split(",").filter(Boolean);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">{TXT.title}</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">{TXT.desc}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <i className="fa-solid fa-magnifying-glass text-sm leading-none"></i>
            </span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={TXT.search}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-blue-400 sm:w-80"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-blue-400"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="fa-flag"
          label={TXT.totalComplaints}
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon="fa-clock"
          label={TXT.pendingCount}
          value={stats.pending}
          color="amber"
        />
        <StatCard
          icon="fa-circle-check"
          label={TXT.resolvedCount}
          value={stats.resolved}
          color="emerald"
        />
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <i className="fa-solid fa-circle-info mt-0.5 text-blue-600"></i>
        <div className="text-sm font-medium text-blue-800">
          <span className="font-bold">{TXT.contactAdmin}:</span>{" "}
          {TXT.contactHint}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-sm font-medium text-gray-500">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i>
            {TXT.loading}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <i className="fa-regular fa-flag text-5xl text-gray-300"></i>
          <h3 className="mt-4 text-lg font-bold text-gray-800">{TXT.empty}</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <Th>#</Th>
                  <Th>{TXT.customer}</Th>
                  <Th>{TXT.facility}</Th>
                  <Th>{TXT.booking}</Th>
                  <Th>{TXT.amount}</Th>
                  <Th>{TXT.reason}</Th>
                  <Th>{TXT.status}</Th>
                  <Th>{TXT.createdAt}</Th>
                  <Th>{TXT.action}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, index) => {
                  const statusInfo = getStatusInfo(item.trang_thai);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70">
                      <Td strong>{index + 1}</Td>
                      <Td>
                        <div className="font-bold text-gray-900">
                          {item.khach_hang?.ho_ten || TXT.noData}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.khach_hang?.so_dien_thoai}
                        </div>
                      </Td>
                      <Td>{item.ten_co_so || TXT.noData}</Td>
                      <Td strong>#{item.dat_san_id}</Td>
                      <Td strong>{formatCurrency(item.dat_san?.da_thanh_toan)}</Td>
                      <Td>
                        <div className="line-clamp-2 max-w-[200px]">
                          {item.ly_do}
                        </div>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </Td>
                      <Td>{formatDateTime(item.ngay_tao)}</Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() => setDetail(item)}
                          title={TXT.viewDetail}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <DetailModal
          complaint={detail}
          onClose={() => setDetail(null)}
          imageList={imageList}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color] || colors.blue}`}
      >
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <div>
        <div className="text-xs font-bold uppercase text-gray-500">{label}</div>
        <div className="mt-0.5 text-xl font-extrabold text-gray-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ complaint, onClose, imageList }) {
  const statusInfo = getStatusInfo(complaint.trang_thai);
  const images = imageList(complaint.hinh_anh);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              {TXT.detailTitle}
            </h2>
            <p className="mt-0.5 text-sm font-bold text-blue-700">
              {TXT.booking} #{complaint.dat_san_id}
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
            <InfoLine label={TXT.customer} value={complaint.khach_hang?.ho_ten} />
            <InfoLine label={TXT.phone} value={complaint.khach_hang?.so_dien_thoai} />
            <InfoLine label={TXT.facility} value={complaint.ten_co_so} />
            <InfoLine label={TXT.amount} value={formatCurrency(complaint.dat_san?.da_thanh_toan)} />
          </section>

          <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <InfoLine label={TXT.reason} value={complaint.ly_do} />
          </section>

          {images.length > 0 && (
            <section className="rounded-2xl border border-gray-200 p-4">
              <div className="mb-2 text-xs font-bold uppercase text-gray-500">
                {TXT.evidence}
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((url, index) => (
                  <a
                    key={index}
                    href={getAssetUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-24 w-24 overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={getAssetUrl(url)}
                      alt={`Minh chứng ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-bold uppercase text-gray-500">
                {TXT.status}
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <InfoLine label={TXT.createdAt} value={formatDateTime(complaint.ngay_tao)} />
            {complaint.ngay_xu_ly && (
              <InfoLine label={TXT.processedAt} value={formatDateTime(complaint.ngay_xu_ly)} />
            )}
            {complaint.ghi_chu_admin && (
              <InfoLine label={TXT.adminNote} value={complaint.ghi_chu_admin} />
            )}
          </section>

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

function Th({ children }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children, strong = false }) {
  return (
    <td
      className={`max-w-[220px] px-4 py-3 align-top ${
        strong ? "font-extrabold text-gray-900" : "font-medium text-gray-600"
      }`}
    >
      <div className="line-clamp-2">{children}</div>
    </td>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-gray-500">{label}</div>
      <div className="mt-1 break-words text-sm font-bold text-gray-900">
        {value || TXT.noData}
      </div>
    </div>
  );
}
