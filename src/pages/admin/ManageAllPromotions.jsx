import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const LIMIT = 10;

const TXT = {
  title: "Quản lý khuyến mãi",
  search: "Tìm mã, tên, cơ sở",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  locked: "Đã khóa",
  deleted: "Đã xóa",
  expired: "Hết hạn",
  code: "Mã",
  name: "Chương trình",
  facility: "Cơ sở",
  owner: "Chủ sân",
  discount: "Mức giảm",
  quantity: "Lượt dùng",
  time: "Thời hạn",
  status: "Trạng thái",
  approval: "Duyệt",
  action: "Thao tác",
  active: "Đang hoạt động",
  noData: "Không có khuyến mãi trong nhóm này",
  loading: "Đang tải dữ liệu...",
  approve: "Duyệt",
  reject: "Hủy",
  lock: "Khóa",
  unlock: "Mở khóa",
  approveTitle: "Duyệt khuyến mãi",
  rejectTitle: "Hủy khuyến mãi",
  lockTitle: "Khóa khuyến mãi",
  unlockTitle: "Mở khóa khuyến mãi",
  success: "Thao tác thành công",
  prev: "Trước",
  next: "Tiếp",
  promotionCount: "khuyến mãi",
};

const TABS = [
  {
    key: "pending",
    icon: "fa-solid fa-hourglass-half",
    label: TXT.pending,
    params: { trang_thai: "not_deleted", trang_thai_duyet: "0" },
  },
  {
    key: "approved",
    icon: "fa-solid fa-circle-check",
    label: TXT.approved,
    params: { trang_thai: "1", trang_thai_duyet: "1", thoi_han: "con_han" },
  },
  {
    key: "locked",
    icon: "fa-solid fa-lock",
    label: TXT.locked,
    params: { trang_thai: "2" },
  },
  {
    key: "deleted",
    icon: "fa-solid fa-trash-can",
    label: TXT.deleted,
    params: { trang_thai: "0" },
  },
  {
    key: "expired",
    icon: "fa-regular fa-calendar-xmark",
    label: TXT.expired,
    params: { trang_thai: "not_deleted", thoi_han: "het_han" },
  },
];

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "";

const isExpired = (promo) =>
  promo.ngay_ket_thuc && new Date(promo.ngay_ket_thuc) < new Date();

const getError = (error, fallback) => error.response?.data?.message || fallback;

const statusText = (promo) => {
  if (Number(promo.trang_thai) === 0) return TXT.deleted;
  if (isExpired(promo)) return TXT.expired;
  if (Number(promo.trang_thai) === 2) return TXT.locked;
  return TXT.active;
};

const statusClass = (promo) => {
  if (Number(promo.trang_thai) === 0) return "bg-rose-50 text-rose-700 border-rose-200";
  if (isExpired(promo)) return "bg-slate-100 text-slate-600 border-slate-200";
  if (Number(promo.trang_thai) === 2) return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

const approvalText = (status) => (Number(status) === 1 ? TXT.approved : TXT.pending);
const approvalClass = (status) =>
  Number(status) === 1
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

const tabStatus = (promo, activeTab) => {
  if (activeTab === "pending") {
    return {
      text: approvalText(promo.trang_thai_duyet),
      className: approvalClass(promo.trang_thai_duyet),
    };
  }

  return {
    text: statusText(promo),
    className: statusClass(promo),
  };
};

export default function ManageAllPromotions() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [promotions, setPromotions] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "",
    danger: false,
    action: null,
  });

  const currentTab = TABS.find((tab) => tab.key === activeTab) || TABS[0];
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / LIMIT)), [total]);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/khuyen-mai/admin", {
        params: {
          ...currentTab.params,
          tu_khoa: keyword.trim(),
          trang: page,
          gioi_han: LIMIT,
        },
      });
      setPromotions(res.data.danh_sach || []);
      setTotal(Number(res.data.tong || 0));
    } catch (error) {
      showToast(getError(error, "Không thể tải khuyến mãi"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentTab, keyword, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromotions();
  }, [fetchPromotions]);

  const switchTab = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const openConfirm = ({ title, message, confirmText, danger = false, action }) => {
    setConfirmState({ open: true, title, message, confirmText, danger, action });
  };

  const runConfirm = async () => {
    try {
      setIsLoading(true);
      await confirmState.action?.();
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchPromotions();
    } catch (error) {
      showToast(getError(error, "Thao tác thất bại"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const actionRequest = (promo, type) => {
    const config = {
      approve: {
        title: TXT.approveTitle,
        message: `${TXT.approve} ${promo.ma_khuyen_mai}?`,
        confirmText: TXT.approve,
        endpoint: `/khuyen-mai/${promo.id}/duyet`,
      },
      reject: {
        title: TXT.rejectTitle,
        message: `${TXT.reject} ${promo.ma_khuyen_mai}?`,
        confirmText: TXT.reject,
        endpoint: `/khuyen-mai/${promo.id}/tu-choi`,
        danger: true,
      },
      lock: {
        title: TXT.lockTitle,
        message: `${TXT.lock} ${promo.ma_khuyen_mai}?`,
        confirmText: TXT.lock,
        endpoint: `/khuyen-mai/${promo.id}/khoa`,
        danger: true,
      },
      unlock: {
        title: TXT.unlockTitle,
        message: `${TXT.unlock} ${promo.ma_khuyen_mai}?`,
        confirmText: TXT.unlock,
        endpoint: `/khuyen-mai/${promo.id}/mo-khoa`,
      },
    }[type];

    openConfirm({
      ...config,
      action: async () => {
        const res = await api.patch(config.endpoint);
        showToast(res.data.message || TXT.success);
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">{TXT.title}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`rounded-2xl border p-4 text-left transition ${
              activeTab === tab.key
                ? "border-[#349DFF] bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-black text-[#0a192f]">
              <i className={`${tab.icon} text-[#349DFF]`}></i>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black text-[#0a192f]">{currentTab.label}</h3>
          </div>
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder={TXT.search}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#349DFF] lg:w-80"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-[#f8fafc] font-bold text-gray-600">
              <tr>
                <Th>STT</Th>
                <Th>{TXT.code}</Th>
                <Th>{TXT.name}</Th>
                <Th>{TXT.facility}</Th>
                <Th>{TXT.owner}</Th>
                <Th>{TXT.discount}</Th>
                <Th>{TXT.quantity}</Th>
                <Th>{TXT.time}</Th>
                <Th>{TXT.status}</Th>
                <Th align="right">{TXT.action}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && promotions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    {TXT.loading}
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    {TXT.noData}
                  </td>
                </tr>
              ) : (
                promotions.map((promo, index) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <Td strong>{(page - 1) * LIMIT + index + 1}</Td>
                    <Td>
                      <span
                        title={promo.ma_khuyen_mai}
                        className="block max-w-[92px] truncate rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 font-mono font-black text-blue-700"
                      >
                        {promo.ma_khuyen_mai}
                      </span>
                    </Td>
                    <Td>
                      <div className="font-bold text-[#0a192f]">{promo.ten}</div>
                    </Td>
                    <Td>{promo.ten_co_so}</Td>
                    <Td>
                      <div>{promo.ten_chu_so}</div>
                      <div className="text-xs text-gray-400">{promo.email_chu_so}</div>
                    </Td>
                    <Td>
                      {Number(promo.loai_giam) === 1
                        ? `${Number(promo.gia_tri_giam)}%`
                        : formatCurrency(promo.gia_tri_giam)}
                    </Td>
                    <Td>
                      {Number(promo.da_su_dung || 0)}/{Number(promo.so_luong || 0)}
                    </Td>
                    <Td className="text-xs">
                      <div>{formatDateTime(promo.ngay_bat_dau)}</div>
                      <div>{formatDateTime(promo.ngay_ket_thuc)}</div>
                    </Td>
                    <Td>
                      <Badge className={tabStatus(promo, activeTab).className}>
                        {tabStatus(promo, activeTab).text}
                      </Badge>
                    </Td>
                    <Td align="right">
                      <div className="inline-flex gap-1">
                        {Number(promo.trang_thai_duyet) === 0 &&
                          Number(promo.trang_thai) !== 0 && (
                            <>
                              <IconButton
                                title={TXT.approve}
                                icon="fa-solid fa-check"
                                success
                                onClick={() => actionRequest(promo, "approve")}
                              />
                              <IconButton
                                title={TXT.reject}
                                icon="fa-solid fa-xmark"
                                danger
                                onClick={() => actionRequest(promo, "reject")}
                              />
                            </>
                          )}
                        {Number(promo.trang_thai) === 2 ? (
                          <IconButton
                            title={TXT.unlock}
                            icon="fa-solid fa-lock-open"
                            onClick={() => actionRequest(promo, "unlock")}
                          />
                        ) : Number(promo.trang_thai) === 1 &&
                          Number(promo.trang_thai_duyet) === 1 ? (
                          <IconButton
                            title={TXT.lock}
                            icon="fa-solid fa-lock"
                            danger
                            onClick={() => actionRequest(promo, "lock")}
                          />
                        ) : null}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} setPage={setPage} />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        danger={confirmState.danger}
        loading={isLoading}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={runConfirm}
      />
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th className={`whitespace-nowrap px-5 py-4 ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({ children, strong = false, align = "left" }) {
  return (
    <td className={`px-5 py-4 align-top ${align === "right" ? "text-right" : "text-left"} ${strong ? "font-bold text-[#0a192f]" : "text-gray-600"}`}>
      {children}
    </td>
  );
}

function Badge({ className, children }) {
  return (
    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

function IconButton({ title, icon, onClick, danger = false, success = false }) {
  const className = success
    ? "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
    : danger
      ? "border-rose-100 text-rose-500 hover:bg-rose-50"
      : "border-gray-200 text-gray-500 hover:bg-gray-50";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-8 w-8 rounded-lg border text-xs transition ${className}`}
    >
      <i className={icon}></i>
    </button>
  );
}

function Pagination({ page, totalPages, total, setPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm text-gray-500">
      <span>
        Trang {page}/{totalPages} - {total} {TXT.promotionCount}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          {TXT.prev}
        </button>
        <button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          {TXT.next}
        </button>
      </div>
    </div>
  );
}
