import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const LIMIT = 10;

const getApprovalBadge = (status) => {
  switch (Number(status)) {
    case 1:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
          Đã duyệt
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
          Chờ duyệt
        </span>
      );
  }
};

const getActiveBadge = (status) => {
  switch (Number(status)) {
    case 1:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
          Hoạt động
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
          Đã khóa
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
          Đã xóa
        </span>
      );
  }
};

export default function ManageAllFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    danger: false,
    action: null,
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / LIMIT)),
    [total],
  );

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = {
        tu_khoa: keyword.trim(),
        trang: page,
        gioi_han: LIMIT,
      };

      if (statusFilter !== "all") params.trang_thai = statusFilter;
      if (approvalFilter !== "all") params.trang_thai_duyet = approvalFilter;

      const res = await api.get("/admin/co-so", { params });
      setFacilities(res.data.danh_sach ?? []);
      setTotal(res.data.tong ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách cơ sở");
    } finally {
      setIsLoading(false);
    }
  }, [approvalFilter, keyword, page, statusFilter]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const openConfirm = ({
    title,
    message,
    confirmText,
    danger = false,
    endpoint,
    successMessage,
  }) => {
    setConfirmState({
      open: true,
      title,
      message,
      confirmText,
      danger,
      action: async () => {
        setIsLoading(true);
        try {
          const res = await api.patch(endpoint);
          showToast(res.data.message || successMessage, "success");
          setConfirmState((prev) => ({ ...prev, open: false }));
          fetchFacilities();
        } catch (err) {
          showToast(err.response?.data?.message || "Thao tác thất bại", "error");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleApprove = (facility) => {
    openConfirm({
      facility,
      title: "Duyệt cơ sở",
      message: `Bạn chắc chắn muốn duyệt cơ sở "${facility.ten}"?`,
      confirmText: "Duyệt",
      endpoint: `/co-so/${facility.id}/duyet`,
      successMessage: "Duyệt cơ sở thành công",
    });
  };

  const handleReject = (facility) => {
    openConfirm({
      facility,
      title: "Từ chối cơ sở",
      message: `Bạn chắc chắn muốn từ chối và xóa hẳn cơ sở chờ duyệt "${facility.ten}"?`,
      confirmText: "Từ chối",
      danger: true,
      endpoint: `/co-so/${facility.id}/tu-choi`,
      successMessage: "Từ chối cơ sở thành công",
    });
  };

  const handleLock = (facility) => {
    openConfirm({
      facility,
      title: "Khóa cơ sở",
      message: `Cơ sở "${facility.ten}" sẽ bị ẩn khỏi người dùng và không thể đặt sân.`,
      confirmText: "Khóa",
      danger: true,
      endpoint: `/admin/co-so/${facility.id}/khoa`,
      successMessage: "Khóa cơ sở thành công",
    });
  };

  const handleUnlock = (facility) => {
    openConfirm({
      facility,
      title: "Mở khóa cơ sở",
      message: `Khôi phục trạng thái hoạt động cho cơ sở "${facility.ten}"?`,
      confirmText: "Mở khóa",
      endpoint: `/admin/co-so/${facility.id}/mo-khoa`,
      successMessage: "Mở khóa cơ sở thành công",
    });
  };

  const handleViewDetail = async (facility) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/co-so/${facility.id}`);
      setSelectedFacility(res.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể tải chi tiết cơ sở",
        "error",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">Quản lý cơ sở</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tất cả cơ sở của chủ sân, duyệt, khóa, xóa mềm và khôi phục.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, địa chỉ, chủ sân"
            className="w-full sm:w-72 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="all">Tất cả hoạt động</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Đã xóa</option>
          </select>
          <select
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="all">Tất cả duyệt</option>
            <option value="0">Chờ duyệt</option>
            <option value="1">Đã duyệt</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                                <th className="px-5 py-4 whitespace-nowrap">STT</th>
                <th className="px-5 py-4 whitespace-nowrap">Ảnh</th>
                <th className="px-5 py-4 whitespace-nowrap">Cơ sở</th>
                <th className="px-5 py-4 whitespace-nowrap">Chủ sân</th>
                <th className="px-5 py-4 whitespace-nowrap">Địa chỉ</th>
                <th className="px-5 py-4 whitespace-nowrap">Sân</th>
                <th className="px-5 py-4 whitespace-nowrap">Hoạt động</th>
                <th className="px-5 py-4 whitespace-nowrap">Duyệt</th>
                <th className="px-5 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && facilities.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    Không có cơ sở phù hợp
                  </td>
                </tr>
              ) : (
                facilities.map((facility, index) => (
                  <tr key={facility.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-500">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        {facility.anh_chinh ? (
                          <img
                            src={getAssetUrl(facility.anh_chinh)}
                            alt={facility.ten}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#0a192f]">{facility.ten}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-medium">
                      <div>{facility.ten_chu_so}</div>
                      <div className="text-xs text-gray-500">
                        {facility.email_chu_so}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 min-w-56">
                      {[facility.dia_chi, facility.phuong_xa, facility.tinh_thanh]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-semibold">
                      {facility.so_san ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      {getActiveBadge(facility.trang_thai)}
                    </td>
                    <td className="px-5 py-4">
                      {getApprovalBadge(facility.trang_thai_duyet)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(facility)}
                          disabled={detailLoading}
                          className="text-gray-500 hover:bg-gray-100 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                          title="Xem chi tiết"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>

                        {Number(facility.trang_thai_duyet) === 0 &&
                        Number(facility.trang_thai) !== 0 ? (
                          <>
                            <button
                              onClick={() => handleApprove(facility)}
                              className="text-green-600 hover:bg-green-50 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-green-200"
                              title="Duyệt"
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleReject(facility)}
                              className="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              title="Từ chối"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          </>
                        ) : Number(facility.trang_thai) === 0 ? (
                          <span className="px-2 text-xs text-gray-400">
                            Đã xóa
                          </span>
                        ) : (
                          <>
                            {Number(facility.trang_thai) === 2 ? (
                              <button
                                onClick={() => handleUnlock(facility)}
                                className="text-emerald-600 hover:bg-emerald-50 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                title="Mở khóa"
                              >
                                <i className="fa-solid fa-lock-open text-xs"></i>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLock(facility)}
                                className="text-orange-600 hover:bg-orange-50 w-8 h-8 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                                title="Khóa"
                              >
                                <i className="fa-solid fa-lock text-xs"></i>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Trang {page}/{totalPages} · {total} cơ sở
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        page === item
                          ? "bg-[#349DFF] text-white"
                          : "border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF]"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
        </div>

      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[calc(100vh-32px)] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <div>
                <h3 className="text-lg font-bold text-[#0a192f]">
                  Chi tiết cơ sở
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  #{selectedFacility.id} - {selectedFacility.ten}
                </p>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Đóng"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
                <div className="space-y-3">
                  <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                    {selectedFacility.hinh_anh?.[0]?.url ? (
                      <img
                        src={getAssetUrl(selectedFacility.hinh_anh[0].url)}
                        alt={selectedFacility.ten}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getActiveBadge(selectedFacility.trang_thai)}
                    {getApprovalBadge(selectedFacility.trang_thai_duyet)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Tên cơ sở</div>
                    <div className="font-semibold text-[#0a192f] mt-1">
                      {selectedFacility.ten}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tỷ lệ cọc</div>
                    <div className="font-semibold text-[#0a192f] mt-1">
                      {selectedFacility.phan_tram_coc !== null &&
                      selectedFacility.phan_tram_coc !== undefined &&
                      selectedFacility.phan_tram_coc !== ""
                        ? `${selectedFacility.phan_tram_coc}%`
                        : "Chưa cấu hình"}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-500">Địa chỉ</div>
                    <div className="font-semibold text-[#0a192f] mt-1">
                      {[
                        selectedFacility.dia_chi,
                        selectedFacility.phuong_xa,
                        selectedFacility.tinh_thanh,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-500">Mô tả</div>
                    <div className="text-[#0a192f] mt-1 whitespace-pre-line">
                      {selectedFacility.mo_ta || "Chưa có mô tả"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h4 className="text-sm font-bold text-[#0a192f] mb-3">
                  Chủ sân
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Họ tên</div>
                    <div className="font-semibold text-[#0a192f] mt-1">
                      {selectedFacility.ten_chu_so}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Email</div>
                    <div className="font-semibold text-[#0a192f] mt-1">
                      {selectedFacility.email_chu_so}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Số điện thoại</div>
                    <div className="font-semibold text-[#0a192f] mt-1">
                      {selectedFacility.sdt_chu_so || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
              </div>

              {selectedFacility.hinh_anh?.length > 1 && (
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-bold text-[#0a192f] mb-3">
                    Hình ảnh
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedFacility.hinh_anh.map((image) => (
                      <div
                        key={image.id}
                        className="aspect-[4/3] rounded-lg bg-gray-100 overflow-hidden border border-gray-200"
                      >
                        <img
                          src={getAssetUrl(image.url)}
                          alt={selectedFacility.ten}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        danger={confirmState.danger}
        loading={isLoading}
        onCancel={() =>
          setConfirmState((prev) => ({
            ...prev,
            open: false,
          }))
        }
        onConfirm={() => confirmState.action?.()}
      />
    </div>
  );
}
