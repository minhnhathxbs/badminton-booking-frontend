import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const TXT = {
  title: "Quản lý hoàn tiền",
  desc: "Xem và xử lý yêu cầu hoàn tiền từ các đơn đã hủy.",
  all: "Tất cả trạng thái",
  pending: "Chờ xử lý",
  approved: "Đã hoàn tiền",
  rejected: "Từ chối",
  search: "Tìm theo khách, SĐT, email, cơ sở hoặc lý do",
  loading: "Đang tải yêu cầu hoàn tiền...",
  empty: "Chưa có yêu cầu hoàn tiền",
  customer: "Khách hàng",
  facility: "Cơ sở",
  booking: "Đơn",
  payment: "Thanh toán",
  amount: "Số tiền hoàn",
  reason: "Lý do",
  status: "Trạng thái",
  requestedAt: "Ngày yêu cầu",
  action: "Thao tác",
  approve: "Duyệt",
  reject: "Từ chối",
  close: "Đóng",
  note: "Ghi chú xử lý",
  notePlaceholder: "Nhập ghi chú cho khách hàng...",
  approveTitle: "Duyệt hoàn tiền",
  rejectTitle: "Từ chối hoàn tiền",
  processing: "Đang xử lý",
  processFail: "Không thể xử lý yêu cầu hoàn tiền",
  loadFail: "Không thể tải yêu cầu hoàn tiền",
  noData: "Chưa có",
};

const STATUS_OPTIONS = [
  { value: "", label: TXT.all },
  { value: "0", label: TXT.pending },
  { value: "1", label: TXT.approved },
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
        label: TXT.approved,
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

export default function ManageRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [status, setStatus] = useState("0");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState("");

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== "") params.trang_thai = status;
      if (keyword.trim()) params.tu_khoa = keyword.trim();

      const res = await api.get("/hoan-tien", { params });
      setRefunds(res.data?.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || TXT.loadFail, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const stats = useMemo(() => {
    return refunds.reduce(
      (acc, item) => {
        acc.total += 1;
        acc.amount += Number(item.so_tien_hoan || 0);
        if (Number(item.trang_thai) === 0) acc.pending += 1;
        return acc;
      },
      { total: 0, pending: 0, amount: 0 },
    );
  }, [refunds]);

  const openDecision = (refund, action) => {
    setDecision({ refund, action });
    setNote(refund.ghi_chu_admin || "");
  };

  const closeDecision = () => {
    setDecision(null);
    setNote("");
  };

  const submitDecision = async () => {
    if (!decision) return;

    const { refund, action } = decision;
    setProcessingId(refund.id);
    try {
      const res = await api.patch(`/hoan-tien/${refund.id}/xu-ly`, {
        trang_thai: action === "approve" ? 1 : 2,
        ghi_chu_admin: note.trim(),
      });

      showToast(res.data?.message || "Xử lý hoàn tiền thành công");
      closeDecision();
      await fetchRefunds();
    } catch (error) {
      showToast(error.response?.data?.message || TXT.processFail, "error");
    } finally {
      setProcessingId(null);
    }
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
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") fetchRefunds();
              }}
              placeholder={TXT.search}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm font-medium outline-none focus:border-[#349DFF] sm:w-80"
            />
          </div>
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
          <button
            type="button"
            onClick={fetchRefunds}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#349DFF] px-4 text-sm font-bold text-white hover:bg-blue-600"
          >
            <i className="fa-solid fa-rotate-right"></i>
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon="fa-receipt" label="Yêu cầu" value={stats.total} />
        <StatCard icon="fa-clock" label={TXT.pending} value={stats.pending} />
        <StatCard
          icon="fa-money-bill-wave"
          label="Tổng tiền trong danh sách"
          value={formatCurrency(stats.amount)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs font-bold uppercase text-gray-500">
              <tr>
                <Th>{TXT.customer}</Th>
                <Th>{TXT.facility}</Th>
                <Th>{TXT.booking}</Th>
                <Th>{TXT.payment}</Th>
                <Th>{TXT.amount}</Th>
                <Th>{TXT.reason}</Th>
                <Th>{TXT.status}</Th>
                <Th>{TXT.requestedAt}</Th>
                <Th>{TXT.action}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="inline-flex items-center gap-3 text-sm font-bold text-gray-500">
                      <i className="fa-solid fa-circle-notch fa-spin text-[#349DFF]"></i>
                      {TXT.loading}
                    </div>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="text-sm font-bold text-gray-500">
                      {TXT.empty}
                    </div>
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => {
                  const statusInfo = getStatusInfo(refund.trang_thai);
                  const canProcess = Number(refund.trang_thai) === 0;
                  return (
                    <tr key={refund.id} className="hover:bg-gray-50/70">
                      <Td strong>
                        <div>{refund.khach_hang?.ho_ten || TXT.noData}</div>
                        <div className="mt-1 text-xs font-medium text-gray-500">
                          {refund.khach_hang?.so_dien_thoai ||
                            refund.khach_hang?.email ||
                            TXT.noData}
                        </div>
                      </Td>
                      <Td>{refund.co_so?.ten || TXT.noData}</Td>
                      <Td>#{refund.dat_san_id}</Td>
                      <Td>
                        <div>{refund.thanh_toan?.ma_giao_dich || TXT.noData}</div>
                        <div className="mt-1 text-xs font-medium text-gray-500">
                          {formatCurrency(refund.thanh_toan?.so_tien)}
                        </div>
                      </Td>
                      <Td strong>{formatCurrency(refund.so_tien_hoan)}</Td>
                      <Td>{refund.ly_do || TXT.noData}</Td>
                      <Td>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </Td>
                      <Td>{formatDateTime(refund.ngay_yeu_cau)}</Td>
                      <Td>
                        {canProcess ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openDecision(refund, "approve")}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title={TXT.approve}
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => openDecision(refund, "reject")}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title={TXT.reject}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">
                            {refund.ghi_chu_admin || TXT.noData}
                          </span>
                        )}
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {decision && (
        <DecisionModal
          decision={decision}
          note={note}
          loading={processingId === decision.refund.id}
          onNoteChange={setNote}
          onClose={closeDecision}
          onConfirm={submitDecision}
        />
      )}
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

function DecisionModal({
  decision,
  note,
  loading,
  onNoteChange,
  onClose,
  onConfirm,
}) {
  const isApprove = decision.action === "approve";
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#0a192f]">
              {isApprove ? TXT.approveTitle : TXT.rejectTitle}
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Đơn #{decision.refund.dat_san_id} -{" "}
              {formatCurrency(decision.refund.so_tien_hoan)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-60"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-bold uppercase text-gray-500">
              {TXT.note}
            </span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder={TXT.notePlaceholder}
              disabled={loading}
              className="mt-2 h-28 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium outline-none focus:border-[#349DFF] disabled:bg-gray-50"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {TXT.close}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300 ${
                isApprove
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  {TXT.processing}
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isApprove ? "fa-check" : "fa-xmark"}`}></i>
                  {isApprove ? TXT.approve : TXT.reject}
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
        strong ? "font-extrabold text-[#0a192f]" : "font-medium text-gray-600"
      }`}
    >
      <div className="line-clamp-3">{children}</div>
    </td>
  );
}
