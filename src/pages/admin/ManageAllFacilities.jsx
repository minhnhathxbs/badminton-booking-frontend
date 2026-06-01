import React, { useEffect, useMemo, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const getStatusBadge = (status) => {
  switch (Number(status)) {
    case 1:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
          Đã duyệt
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
          Từ chối
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

export default function ManageAllFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    danger: false,
    action: null,
  });

  const fetchFacilities = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/co-so/admin");
      setFacilities(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách cơ sở");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    if (statusFilter === "all") return facilities;
    return facilities.filter(
      (facility) => Number(facility.trang_thai_duyet) === Number(statusFilter),
    );
  }, [facilities, statusFilter]);

  const handleApprove = async (facility) => {
    setConfirmState({
      open: true,
      title: "Xác nhận duyệt cơ sở",
      message: `Bạn chắc chắn muốn duyệt cơ sở "${facility.ten}"? Cơ sở sẽ được hiển thị cho người dùng.`,
      confirmText: "Duyệt",
      danger: false,
      action: () => approveFacility(facility),
    });
  };

  const approveFacility = async (facility) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/co-so/${facility.id}/duyet`);
      showToast(res.data.message || "Duyệt cơ sở thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchFacilities();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể duyệt cơ sở", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (facility) => {
    setConfirmState({
      open: true,
      title: "Xác nhận từ chối cơ sở",
      message: `Bạn chắc chắn muốn từ chối và xóa cơ sở "${facility.ten}"? Thao tác này sẽ xóa hẳn cơ sở đang chờ duyệt.`,
      confirmText: "Từ chối",
      danger: true,
      action: () => rejectFacility(facility),
    });
  };

  const rejectFacility = async (facility) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/co-so/${facility.id}/tu-choi`);
      showToast(res.data.message || "Từ chối cơ sở thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchFacilities();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể từ chối cơ sở",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">Duyệt cơ sở mới</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các yêu cầu đăng ký cơ sở từ chủ sân
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="0">Chờ duyệt</option>
            <option value="1">Đã duyệt</option>
            <option value="2">Từ chối</option>
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
                <th className="px-6 py-4 whitespace-nowrap">Ảnh</th>
                <th className="px-6 py-4 whitespace-nowrap">Mã CS</th>
                <th className="px-6 py-4 whitespace-nowrap">Tên cơ sở</th>
                <th className="px-6 py-4 whitespace-nowrap">Chủ sân</th>
                <th className="px-6 py-4 whitespace-nowrap">Địa chỉ</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && facilities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredFacilities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Không có cơ sở phù hợp
                  </td>
                </tr>
              ) : (
                filteredFacilities.map((facility) => (
                  <tr
                    key={facility.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 font-bold text-[#349DFF]">
                      #{facility.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0a192f]">
                      {facility.ten}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      <div>{facility.chu_san}</div>
                      <div className="text-xs text-gray-500">
                        {facility.email_chu_san}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {facility.dia_chi}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(facility.trang_thai_duyet)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {Number(facility.trang_thai_duyet) === 0 ? (
                        <>
                          <button
                            onClick={() => handleApprove(facility)}
                            className="text-green-600 hover:bg-green-50 w-8 h-8 rounded-lg transition-colors mr-1 border border-transparent hover:border-green-200"
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
                      ) : (
                        <span className="text-xs text-gray-400">
                          Đã xử lý
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
