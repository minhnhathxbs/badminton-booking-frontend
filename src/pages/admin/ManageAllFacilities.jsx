import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const LIMIT = 10;

const TXT = {
  title: "Quản lý cơ sở",
  search: "Tìm tên, địa chỉ, chủ sân",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  locked: "Đã khóa",
  deleted: "Đã ẩn",
  facility: "Cơ sở",
  image: "Ảnh",
  owner: "Chủ sân",
  address: "Địa chỉ",
  courts: "Sân",
  status: "Trạng thái",
  approval: "Duyệt",
  action: "Thao tác",
  active: "Đang hoạt động",
  noData: "Không có cơ sở trong nhóm này",
  loading: "Đang tải dữ liệu...",
  approve: "Duyệt",
  reject: "Từ chối",
  lock: "Khóa",
  unlock: "Mở khóa",
  view: "Xem chi tiết",
  approveTitle: "Duyệt cơ sở",
  rejectTitle: "Từ chối cơ sở",
  lockTitle: "Khóa cơ sở",
  unlockTitle: "Mở khóa cơ sở",
  success: "Thao tác thành công",
  prev: "Trước",
  next: "Tiếp",
  facilityCount: "cơ sở",
};

const TABS = [
  {
    key: "pending",
    icon: "fa-solid fa-hourglass-half",
    label: TXT.pending,
    params: { trang_thai_duyet: "0" },
  },
  {
    key: "approved",
    icon: "fa-solid fa-circle-check",
    label: TXT.approved,
    params: { trang_thai: "1", trang_thai_duyet: "1" },
  },
  {
    key: "locked",
    icon: "fa-solid fa-lock",
    label: TXT.locked,
    params: { trang_thai: "2" },
  },
];

const getError = (error, fallback) => error.response?.data?.message || fallback;

const facilityAddress = (facility) =>
  [facility?.dia_chi, facility?.phuong_xa, facility?.tinh_thanh]
    .filter(Boolean)
    .join(", ");

const activeText = (status) => {
  if (Number(status) === 0) return TXT.deleted;
  if (Number(status) === 2) return TXT.locked;
  return TXT.active;
};

const activeClass = (status) => {
  if (Number(status) === 0) return "bg-rose-50 text-rose-700 border-rose-200";
  if (Number(status) === 2) return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

const approvalText = (status) => (Number(status) === 1 ? TXT.approved : TXT.pending);
const approvalClass = (status) =>
  Number(status) === 1
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

const tabStatus = (facility, activeTab) => {
  if (activeTab === "pending") {
    return {
      text: approvalText(facility.trang_thai_duyet),
      className: approvalClass(facility.trang_thai_duyet),
    };
  }

  return {
    text: activeText(facility.trang_thai),
    className: activeClass(facility.trang_thai),
  };
};

export default function ManageAllFacilities() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [facilities, setFacilities] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [error, setError] = useState("");
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

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/co-so", {
        params: {
          ...currentTab.params,
          tu_khoa: keyword.trim(),
          trang: page,
          gioi_han: LIMIT,
        },
      });
      setFacilities(res.data.danh_sach ?? []);
      setTotal(Number(res.data.tong ?? 0));
    } catch (error) {
      const message = getError(error, "Không thể tải danh sách cơ sở");
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentTab, keyword, page]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

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
      fetchFacilities();
    } catch (error) {
      showToast(getError(error, "Thao tác thất bại"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const actionRequest = (facility, type) => {
    const config = {
      approve: {
        title: TXT.approveTitle,
        message: `Bạn chắc chắn muốn duyệt cơ sở "${facility.ten}"?`,
        confirmText: TXT.approve,
        endpoint: `/co-so/${facility.id}/duyet`,
      },
      reject: {
        title: TXT.rejectTitle,
        message: `Bạn chắc chắn muốn từ chối và xóa hẳn cơ sở chờ duyệt "${facility.ten}"?`,
        confirmText: TXT.reject,
        endpoint: `/co-so/${facility.id}/tu-choi`,
        danger: true,
      },
      lock: {
        title: TXT.lockTitle,
        message: `Cơ sở "${facility.ten}" sẽ bị ẩn khỏi người dùng và không thể đặt sân.`,
        confirmText: TXT.lock,
        endpoint: `/admin/co-so/${facility.id}/khoa`,
        danger: true,
      },
      unlock: {
        title: TXT.unlockTitle,
        message: `Khôi phục trạng thái hoạt động cho cơ sở "${facility.ten}"?`,
        confirmText: TXT.unlock,
        endpoint: `/admin/co-so/${facility.id}/mo-khoa`,
      },
    }[type];

    openConfirm({
      ...config,
      action: async () => {
        const res = await api.patch(config.endpoint);
        showToast(res.data.message || TXT.success, "success");
      },
    });
  };

  const handleViewDetail = async (facility) => {
    setDetailLoadingId(facility.id);
    try {
      const res = await api.get(`/admin/co-so/${facility.id}`);
      setSelectedFacility(res.data);
    } catch (error) {
      showToast(getError(error, "Không thể tải chi tiết cơ sở"), "error");
    } finally {
      setDetailLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">{TXT.title}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
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
          <div className="relative w-full lg:w-80">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <i className="fa-solid fa-magnifying-glass text-sm leading-none"></i>
            </span>
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder={TXT.search}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#349DFF]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-[#f8fafc] font-bold text-gray-600">
              <tr>
                <Th>STT</Th>
                <Th>{TXT.image}</Th>
                <Th>{TXT.facility}</Th>
                <Th>{TXT.owner}</Th>
                <Th>{TXT.address}</Th>
                <Th>{TXT.courts}</Th>
                <Th>{TXT.status}</Th>
                <Th>{TXT.approval}</Th>
                <Th align="right">{TXT.action}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && facilities.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    {TXT.loading}
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    {TXT.noData}
                  </td>
                </tr>
              ) : (
                facilities.map((facility, index) => (
                  <tr key={facility.id} className="hover:bg-gray-50">
                    <Td strong>{(page - 1) * LIMIT + index + 1}</Td>
                    <Td>
                      <div className="h-12 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        {facility.anh_chinh ? (
                          <img
                            src={getAssetUrl(facility.anh_chinh)}
                            alt={facility.ten}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <i className="fa-regular fa-image"></i>
                          </div>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="font-bold text-[#0a192f]">{facility.ten}</div>
                      <div className="text-xs text-gray-400">#{facility.id}</div>
                    </Td>
                    <Td>
                      <div className="font-medium text-gray-700">{facility.ten_chu_so}</div>
                      <div className="text-xs text-gray-400">{facility.email_chu_so}</div>
                    </Td>
                    <Td className="min-w-64">{facilityAddress(facility) || "-"}</Td>
                    <Td>{facility.so_san ?? 0}</Td>
                    <Td>
                      <Badge className={tabStatus(facility, activeTab).className}>
                        {tabStatus(facility, activeTab).text}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge className={approvalClass(facility.trang_thai_duyet)}>
                        {approvalText(facility.trang_thai_duyet)}
                      </Badge>
                    </Td>
                    <Td align="right">
                      <div className="inline-flex gap-1">
                        <IconButton
                          title={TXT.view}
                          icon={
                            detailLoadingId === facility.id
                              ? "fa-solid fa-spinner fa-spin"
                              : "fa-solid fa-eye"
                          }
                          onClick={() => handleViewDetail(facility)}
                          disabled={detailLoadingId === facility.id}
                        />
                        {Number(facility.trang_thai_duyet) === 0 &&
                          Number(facility.trang_thai) !== 0 && (
                            <>
                              <IconButton
                                title={TXT.approve}
                                icon="fa-solid fa-check"
                                success
                                onClick={() => actionRequest(facility, "approve")}
                              />
                              <IconButton
                                title={TXT.reject}
                                icon="fa-solid fa-xmark"
                                danger
                                onClick={() => actionRequest(facility, "reject")}
                              />
                            </>
                          )}
                        {Number(facility.trang_thai) === 2 ? (
                          <IconButton
                            title={TXT.unlock}
                            icon="fa-solid fa-lock-open"
                            onClick={() => actionRequest(facility, "unlock")}
                          />
                        ) : Number(facility.trang_thai) === 1 ? (
                          <IconButton
                            title={TXT.lock}
                            icon="fa-solid fa-lock"
                            danger
                            onClick={() => actionRequest(facility, "lock")}
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

      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}

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

function FacilityDetailModal({ facility, onClose }) {
  const images = facility.hinh_anh || [];
  const cover = images[0]?.url || facility.anh_chinh;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
      <div className="max-h-[calc(100vh-32px)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8fafc] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#0a192f]">Chi tiết cơ sở</h3>
            <p className="mt-1 text-sm text-gray-500">
              #{facility.id} - {facility.ten}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-red-500"
            title="Đóng"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
            <div className="space-y-3">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                {cover ? (
                  <img
                    src={getAssetUrl(cover)}
                    alt={facility.ten}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={activeClass(facility.trang_thai)}>
                  {activeText(facility.trang_thai)}
                </Badge>
                <Badge className={approvalClass(facility.trang_thai_duyet)}>
                  {approvalText(facility.trang_thai_duyet)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <InfoLine label="Tên cơ sở" value={facility.ten} />
              <InfoLine
                label="Tỷ lệ cọc"
                value={
                  facility.phan_tram_coc !== null &&
                  facility.phan_tram_coc !== undefined &&
                  facility.phan_tram_coc !== ""
                    ? `${facility.phan_tram_coc}%`
                    : "Chưa cấu hình"
                }
              />
              <InfoLine label="Địa chỉ" value={facilityAddress(facility)} wide />
              <InfoLine label="Mô tả" value={facility.mo_ta || "Chưa có mô tả"} wide multiline />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h4 className="mb-3 text-sm font-bold text-[#0a192f]">Chủ sân</h4>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              <InfoLine label="Họ tên" value={facility.ten_chu_so} />
              <InfoLine label="Email" value={facility.email_chu_so} />
              <InfoLine label="Số điện thoại" value={facility.sdt_chu_so || "Chưa cập nhật"} />
            </div>
          </div>

          {images.length > 1 && (
            <div className="border-t border-gray-100 pt-5">
              <h4 className="mb-3 text-sm font-bold text-[#0a192f]">Hình ảnh</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((image) => (
                  <div
                    key={image.id || image.url}
                    className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  >
                    <img
                      src={getAssetUrl(image.url)}
                      alt={facility.ten}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value, wide = false, multiline = false }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-gray-500">{label}</div>
      <div className={`mt-1 font-semibold text-[#0a192f] ${multiline ? "whitespace-pre-line font-normal" : ""}`}>
        {value || "-"}
      </div>
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

function Td({ children, strong = false, align = "left", className = "" }) {
  return (
    <td className={`px-5 py-4 align-top ${align === "right" ? "text-right" : "text-left"} ${strong ? "font-bold text-[#0a192f]" : "text-gray-600"} ${className}`}>
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

function IconButton({
  title,
  icon,
  onClick,
  danger = false,
  success = false,
  disabled = false,
}) {
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
      disabled={disabled}
      className={`h-8 w-8 rounded-lg border text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
        Trang {page}/{totalPages} - {total} {TXT.facilityCount}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          {TXT.prev}
        </button>
        <button
          type="button"
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
