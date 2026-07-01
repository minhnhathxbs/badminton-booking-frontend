import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const LIMIT = 10;
const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0a192f] outline-none transition focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF]";

const TXT = {
  title: "Quản lý khuyến mãi",
  add: "Tạo khuyến mãi",
  edit: "Sửa khuyến mãi",
  search: "Tìm mã, tên, cơ sở",
  tabUsable: "Đang dùng",
  tabLocked: "Đã khóa",
  tabApproval: "Trạng thái duyệt",
  tabDeleted: "Đã xóa",
  tabExpired: "Hết hạn",
  code: "Mã",
  name: "Chương trình",
  facility: "Cơ sở",
  discount: "Mức giảm",
  quantity: "Lượt dùng",
  time: "Thời hạn",
  status: "Trạng thái",
  approval: "Duyệt",
  action: "Thao tác",
  active: "Đang hoạt động",
  locked: "Đã khóa",
  deleted: "Đã xóa",
  waiting: "Chờ duyệt",
  approved: "Đã duyệt",
  expired: "Hết hạn",
  noData: "Không có khuyến mãi trong nhóm này",
  loading: "Đang tải dữ liệu...",
  save: "Lưu",
  saving: "Đang lưu...",
  close: "Đóng",
  deleteTitle: "Xóa khuyến mãi",
  deleteText: "Mã sẽ được xóa mềm và không còn áp dụng.",
  restoreTitle: "Khôi phục khuyến mãi",
  restoreText: "Mã sẽ quay lại trạng thái chờ admin duyệt.",
  restore: "Khôi phục",
  delete: "Xóa",
  editAction: "Sửa",
  percent: "Phần trăm",
  fixedMoney: "Số tiền cố định",
  chooseFacility: "Chọn cơ sở",
  promotionCode: "Mã khuyến mãi",
  promotionName: "Tên chương trình",
  discountType: "Loại giảm",
  discountPercent: "Giá trị giảm (%)",
  discountMoney: "Số tiền giảm (đ)",
  maxDiscount: "Giảm tối đa (đ)",
  minOrder: "Đơn tối thiểu (đ)",
  amount: "Số lượng",
  startDate: "Ngày bắt đầu",
  endDate: "Ngày kết thúc",
  prev: "Trước",
  next: "Tiếp",
  promotionCount: "khuyến mãi",
};

const TABS = [
  {
    key: "usable",
    icon: "fa-solid fa-bolt",
    label: TXT.tabUsable,
    params: { trang_thai: "1", trang_thai_duyet: "1", thoi_han: "con_han" },
  },
  {
    key: "locked",
    icon: "fa-solid fa-lock",
    label: TXT.tabLocked,
    params: { trang_thai: "2", trang_thai_duyet: "1", thoi_han: "con_han" },
  },
  {
    key: "approval",
    icon: "fa-solid fa-hourglass-half",
    label: TXT.tabApproval,
    params: { trang_thai: "not_deleted", trang_thai_duyet: "0" },
  },
  {
    key: "deleted",
    icon: "fa-solid fa-trash-can",
    label: TXT.tabDeleted,
    params: { trang_thai: "0" },
  },
  {
    key: "expired",
    icon: "fa-regular fa-calendar-xmark",
    label: TXT.tabExpired,
    params: { trang_thai: "not_deleted", thoi_han: "het_han" },
  },
];

const emptyForm = {
  co_so_id: "",
  ma_khuyen_mai: "",
  ten: "",
  mo_ta: "",
  loai_giam: "1",
  gia_tri_giam: "",
  giam_toi_da: "",
  don_toi_thieu: "0",
  so_luong: "0",
  ngay_bat_dau: "",
  ngay_ket_thuc: "",
};

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "";

const isExpired = (promo) =>
  promo.ngay_ket_thuc && new Date(promo.ngay_ket_thuc) < new Date();

const getError = (error, fallback) => error.response?.data?.message || fallback;

const getStatusText = (promo) => {
  if (Number(promo.trang_thai) === 0) return TXT.deleted;
  if (isExpired(promo)) return TXT.expired;
  if (Number(promo.trang_thai) === 2) return TXT.locked;
  return TXT.active;
};

const getStatusClass = (promo) => {
  if (Number(promo.trang_thai) === 0) return "bg-rose-50 text-rose-700 border-rose-200";
  if (isExpired(promo)) return "bg-slate-100 text-slate-600 border-slate-200";
  if (Number(promo.trang_thai) === 2) return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

const getApprovalText = (status) =>
  Number(status) === 1 ? TXT.approved : TXT.waiting;

const getApprovalClass = (status) =>
  Number(status) === 1
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

const getTabStatus = (promo, activeTab) => {
  if (activeTab === "approval") {
    return {
      text: getApprovalText(promo.trang_thai_duyet),
      className: getApprovalClass(promo.trang_thai_duyet),
    };
  }

  return {
    text: getStatusText(promo),
    className: getStatusClass(promo),
  };
};

export default function ManagePromotions() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [promotions, setPromotions] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
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
    const res = await api.get("/co-so/cua-toi", { params: { trang_thai: 1 } });
    const approved = (res.data || []).filter(
      (item) => Number(item.trang_thai_duyet) === 1,
    );
    setFacilities(approved);
  }, []);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/khuyen-mai/cua-toi", {
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
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromotions();
  }, [fetchPromotions]);

  const switchTab = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
    setForm({ ...emptyForm, co_so_id: facilities[0]?.id || "" });
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setIsFormOpen(true);
    setForm({
      co_so_id: promo.co_so_id || "",
      ma_khuyen_mai: promo.ma_khuyen_mai || "",
      ten: promo.ten || "",
      mo_ta: promo.mo_ta || "",
      loai_giam: String(promo.loai_giam || 1),
      gia_tri_giam: String(Number(promo.gia_tri_giam || 0)),
      giam_toi_da:
        promo.giam_toi_da === null || promo.giam_toi_da === undefined
          ? ""
          : String(Number(promo.giam_toi_da)),
      don_toi_thieu: String(Number(promo.don_toi_thieu || 0)),
      so_luong: String(Number(promo.so_luong || 0)),
      ngay_bat_dau: toInputDateTime(promo.ngay_bat_dau),
      ngay_ket_thuc: toInputDateTime(promo.ngay_ket_thuc),
    });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "loai_giam" && value === "2" ? { giam_toi_da: "" } : {}),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        ma_khuyen_mai: form.ma_khuyen_mai.trim().toUpperCase(),
        giam_toi_da: form.loai_giam === "1" ? form.giam_toi_da : "",
      };
      const res = editing
        ? await api.put(`/khuyen-mai/${editing.id}`, payload)
        : await api.post("/khuyen-mai", payload);

      showToast(res.data.message || "Lưu khuyến mãi thành công", "success");
      closeForm();
      fetchPromotions();
    } catch (error) {
      showToast(getError(error, "Không thể lưu khuyến mãi"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = ({ title, message, confirmText, danger, action }) => {
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

  const handleDelete = (promo) => {
    openConfirm({
      title: TXT.deleteTitle,
      message: `${TXT.deleteText} (${promo.ma_khuyen_mai})`,
      confirmText: TXT.delete,
      danger: true,
      action: async () => {
        const res = await api.delete(`/khuyen-mai/${promo.id}`);
        showToast(res.data.message || "Xóa khuyến mãi thành công");
      },
    });
  };

  const handleRestore = (promo) => {
    openConfirm({
      title: TXT.restoreTitle,
      message: `${TXT.restoreText} (${promo.ma_khuyen_mai})`,
      confirmText: TXT.restore,
      danger: false,
      action: async () => {
        const res = await api.patch(`/khuyen-mai/${promo.id}/khoi-phuc`);
        showToast(res.data.message || "Khôi phục khuyến mãi thành công");
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">{TXT.title}</h2>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#349DFF] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600"
        >
          <i className="fa-solid fa-plus"></i>
          {TXT.add}
        </button>
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

      <PromotionTable
        promotions={promotions}
        page={page}
        isLoading={isLoading}
        activeTab={activeTab}
        onEdit={openEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      <Pagination page={page} totalPages={totalPages} total={total} setPage={setPage} />

      {isFormOpen && (
        <PromotionModal
          title={editing ? TXT.edit : TXT.add}
          form={form}
          facilities={facilities}
          isSaving={isSaving}
          onChange={handleChange}
          onClose={closeForm}
          onSubmit={handleSave}
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

function PromotionTable({ promotions, page, isLoading, activeTab, onEdit, onDelete, onRestore }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-[#f8fafc] font-bold text-gray-600">
            <tr>
              <Th>STT</Th>
              <Th>{TXT.code}</Th>
              <Th>{TXT.name}</Th>
              <Th>{TXT.facility}</Th>
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
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  {TXT.loading}
                </td>
              </tr>
            ) : promotions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  {TXT.noData}
                </td>
              </tr>
            ) : (
              promotions.map((promo, index) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <Td strong>{(page - 1) * LIMIT + index + 1}</Td>
                  <Td>
                    <span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 font-mono font-black text-blue-700">
                      {promo.ma_khuyen_mai}
                    </span>
                  </Td>
                  <Td>
                    <div className="font-bold text-[#0a192f]">{promo.ten}</div>
                  </Td>
                  <Td>{promo.ten_co_so}</Td>
                  <Td>
                    <div className="font-bold text-rose-600">
                      {Number(promo.loai_giam) === 1
                        ? `${Number(promo.gia_tri_giam)}%`
                        : formatCurrency(promo.gia_tri_giam)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {promo.giam_toi_da ? `Tối đa ${formatCurrency(promo.giam_toi_da)}` : ""}
                    </div>
                  </Td>
                  <Td>
                    {Number(promo.da_su_dung || 0)}/{Number(promo.so_luong || 0)}
                  </Td>
                  <Td className="text-xs">
                    <div>{formatDateTime(promo.ngay_bat_dau)}</div>
                    <div>{formatDateTime(promo.ngay_ket_thuc)}</div>
                  </Td>
                  <Td>
                    <Badge className={getTabStatus(promo, activeTab).className}>
                      {getTabStatus(promo, activeTab).text}
                    </Badge>
                  </Td>
                  <Td align="right">
                    <div className="inline-flex gap-1">
                      {Number(promo.trang_thai) === 0 ? (
                        <IconButton
                          title={TXT.restore}
                          icon="fa-solid fa-rotate-left"
                          onClick={() => onRestore(promo)}
                        />
                      ) : (
                        <>
                          <IconButton
                            title={TXT.editAction}
                            icon="fa-solid fa-pen"
                            onClick={() => onEdit(promo)}
                          />
                          <IconButton
                            title={TXT.delete}
                            icon="fa-solid fa-trash"
                            danger
                            onClick={() => onDelete(promo)}
                          />
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PromotionModal({
  title,
  form,
  facilities,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}) {
  const isPercentDiscount = String(form.loai_giam) === "1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <h3 className="text-lg font-bold text-[#0a192f]">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-rose-500">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <Field label={TXT.facility}>
            <select name="co_so_id" value={form.co_so_id} onChange={onChange} required className={INPUT_CLASS}>
              <option value="">{TXT.chooseFacility}</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.ten}
                </option>
              ))}
            </select>
          </Field>
          <Field label={TXT.promotionCode}>
            <input name="ma_khuyen_mai" value={form.ma_khuyen_mai} onChange={onChange} required className={`${INPUT_CLASS} uppercase`} placeholder="VD: SUMMER2026" />
          </Field>
          <Field label={TXT.promotionName}>
            <input name="ten" value={form.ten} onChange={onChange} required className={INPUT_CLASS} />
          </Field>
          <Field label={TXT.discountType}>
            <select name="loai_giam" value={form.loai_giam} onChange={onChange} className={INPUT_CLASS}>
              <option value="1">{TXT.percent}</option>
              <option value="2">{TXT.fixedMoney}</option>
            </select>
          </Field>
          <Field label={isPercentDiscount ? TXT.discountPercent : TXT.discountMoney}>
            <input name="gia_tri_giam" type="number" min="1" max={isPercentDiscount ? "100" : undefined} value={form.gia_tri_giam} onChange={onChange} required className={INPUT_CLASS} placeholder={isPercentDiscount ? "VD: 10" : "VD: 50000"} />
          </Field>
          {isPercentDiscount ? (
            <Field label={TXT.maxDiscount}>
              <input name="giam_toi_da" type="number" min="0" value={form.giam_toi_da} onChange={onChange} className={INPUT_CLASS} placeholder="VD: 50000" />
            </Field>
          ) : null}
          <Field label={TXT.minOrder}>
            <input name="don_toi_thieu" type="number" min="0" value={form.don_toi_thieu} onChange={onChange} className={INPUT_CLASS} placeholder="VD: 200000" />
          </Field>
          <Field label={TXT.amount}>
            <input name="so_luong" type="number" min="0" value={form.so_luong} onChange={onChange} className={INPUT_CLASS} />
          </Field>
          <Field label={TXT.startDate}>
            <input name="ngay_bat_dau" type="datetime-local" value={form.ngay_bat_dau} onChange={onChange} required className={INPUT_CLASS} />
          </Field>
          <Field label={TXT.endDate}>
            <input name="ngay_ket_thuc" type="datetime-local" value={form.ngay_ket_thuc} onChange={onChange} required className={INPUT_CLASS} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600">
            {TXT.close}
          </button>
          <button disabled={isSaving} className="rounded-xl bg-[#349DFF] px-5 py-2 text-sm font-bold text-white disabled:opacity-60">
            {isSaving ? TXT.saving : TXT.save}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5 text-sm font-bold text-[#0a192f]">
      <span>{label}</span>
      {children}
    </label>
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

function IconButton({ title, icon, onClick, danger = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-8 w-8 rounded-lg border text-xs transition ${
        danger
          ? "border-rose-100 text-rose-500 hover:bg-rose-50"
          : "border-gray-200 text-gray-500 hover:bg-gray-50"
      }`}
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
