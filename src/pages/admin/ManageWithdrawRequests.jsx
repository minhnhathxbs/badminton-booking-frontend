import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const GIOI_HAN = 10;

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "Chưa xử lý";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getStatus = (value) => {
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

export default function ManageWithdrawRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [trang, setTrang] = useState(1);
  const [tongSo, setTongSo] = useState(0);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const tongSoTrang = useMemo(
    () => Math.max(1, Math.ceil(tongSo / GIOI_HAN)),
    [tongSo],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setTuKhoa(searchInput);
      setTrang(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/rut-tien", {
        params: {
          tu_khoa: tuKhoa,
          trang_thai: trangThai,
          trang,
          gioi_han: GIOI_HAN,
        },
      });

      setRequests(res.data?.danh_sach || []);
      setTongSo(Number(res.data?.tong || 0));
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải yêu cầu rút tiền");
      setRequests([]);
      setTongSo(0);
    } finally {
      setLoading(false);
    }
  }, [tuKhoa, trangThai, trang]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const closeActionModal = () => {
    setApproveTarget(null);
    setRejectTarget(null);
    setAdminNote("");
  };

  const handleApprove = async () => {
    if (!approveTarget) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/rut-tien/${approveTarget.id}/duyet`, {
        ghi_chu_admin: adminNote,
      });
      showToast(res.data?.message || "Duyệt yêu cầu rút tiền thành công", "success");
      closeActionModal();
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể duyệt yêu cầu", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/rut-tien/${rejectTarget.id}/tu-choi`, {
        ghi_chu_admin: adminNote,
      });
      showToast(res.data?.message || "Từ chối yêu cầu rút tiền thành công", "success");
      closeActionModal();
      fetchRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể từ chối yêu cầu", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Duyệt rút tiền
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các yêu cầu rút tiền từ chủ sân
            {!loading && (
              <span className="ml-2 font-medium text-[#349DFF]">
                ({tongSo} yêu cầu)
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={trangThai}
            onChange={(e) => {
              setTrangThai(e.target.value);
              setTrang(1);
            }}
            className="h-10 px-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="0">Chờ duyệt</option>
            <option value="1">Đã duyệt</option>
            <option value="2">Từ chối</option>
          </select>

          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm chủ sân, ngân hàng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full sm:w-72 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
          <button onClick={fetchRequests} className="ml-auto underline text-xs">
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Chủ sân</th>
                <th className="px-6 py-4 whitespace-nowrap">Tài khoản nhận</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Số tiền
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap">Ngày tạo</th>
                <th className="px-6 py-4 whitespace-nowrap">Ngày xử lý</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-36 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-40 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24 ml-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-100 rounded-lg w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-gray-100 rounded-lg w-28 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : requests.length > 0 ? (
                requests.map((item) => {
                  const status = getStatus(item.trang_thai);
                  const isPending = Number(item.trang_thai) === 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0a192f]">
                          {item.ten_chu_san}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.email_chu_san}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.sdt_chu_san || "Chưa có SĐT"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-700">
                          {item.ngan_hang}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.so_tai_khoan}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.ten_chu_tai_khoan}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">
                        {formatCurrency(item.so_tien)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${status.className}`}
                        >
                          {status.label}
                        </span>
                        {item.ghi_chu_admin && (
                          <div className="text-xs text-gray-500 mt-2 max-w-48">
                            {item.ghi_chu_admin}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {formatDateTime(item.ngay_tao)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {formatDateTime(item.ngay_xu_ly)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setApproveTarget(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => setRejectTarget(item)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Đã xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-400">
                    <i className="fa-solid fa-money-bill-transfer text-3xl mb-3 block opacity-30" />
                    Không có yêu cầu rút tiền nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && tongSoTrang > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Trang {trang}/{tongSoTrang} · {tongSo} yêu cầu
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrang((current) => Math.max(1, current - 1))}
                disabled={trang === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setTrang((current) => Math.min(tongSoTrang, current + 1))
                }
                disabled={trang === tongSoTrang}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {(approveTarget || rejectTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 bg-[#f8fafc]">
              <div>
                <h3 className="text-lg font-bold text-[#0a192f]">
                  {approveTarget ? "Duyệt yêu cầu rút tiền" : "Từ chối yêu cầu"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency((approveTarget || rejectTarget)?.so_tien)} ·{" "}
                  {(approveTarget || rejectTarget)?.ten_chu_san}
                </p>
              </div>
              <button
                onClick={closeActionModal}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#f8fafc] rounded-xl p-4 text-sm text-gray-600">
                <div className="font-medium text-[#0a192f] mb-1">
                  {(approveTarget || rejectTarget)?.ngan_hang} -{" "}
                  {(approveTarget || rejectTarget)?.so_tai_khoan}
                </div>
                <div>{(approveTarget || rejectTarget)?.ten_chu_tai_khoan}</div>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Ghi chú admin {rejectTarget ? "*" : ""}
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="4"
                  className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF] resize-none"
                  placeholder={
                    rejectTarget
                      ? "Nhập lý do từ chối"
                      : "Ghi chú chuyển khoản nếu có"
                  }
                />
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-70"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={approveTarget ? handleApprove : handleReject}
                  className={`w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-70 ${
                    approveTarget
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionLoading
                    ? "Đang xử lý..."
                    : approveTarget
                      ? "Xác nhận duyệt"
                      : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
