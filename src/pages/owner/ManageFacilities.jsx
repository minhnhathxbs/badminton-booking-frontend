import React, { useEffect, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const initialForm = {
  ten: "",
  dia_chi: "",
  phuong_xa: "",
  tinh_thanh: "",
  vi_do: "",
  kinh_do: "",
  mo_ta: "",
  hinh_anh: [],
};

const getTrangThaiDuyet = (value) => {
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

const getTrangThaiCoSo = (trangThai, trangThaiDuyet) => {
  if (Number(trangThai) === 0) {
    return {
      label: "Đã xóa",
      className: "bg-gray-100 text-gray-600 border border-gray-200",
    };
  }

  if (Number(trangThai) === 2) {
    return {
      label: "Đã khóa",
      className: "bg-orange-50 text-orange-700 border border-orange-200",
    };
  }

  switch (Number(trangThaiDuyet)) {
    case 1:
      return {
        label: "Đang hoạt động",
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

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingFacility, setEditingFacility] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(1);
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
    try {
      const res = await api.get(`/co-so/cua-toi?trang_thai=${statusFilter}`);
      setFacilities(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách cơ sở");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [statusFilter]);

  const openCreateModal = () => {
    setEditingFacility(null);
    setFormData(initialForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (facility) => {
    setEditingFacility(facility);
    setFormData({
      ten: facility.ten || "",
      dia_chi: facility.dia_chi || "",
      phuong_xa: facility.phuong_xa || "",
      tinh_thanh: facility.tinh_thanh || "",
      vi_do: facility.vi_do ?? "",
      kinh_do: facility.kinh_do ?? "",
      mo_ta: facility.mo_ta || "",
      hinh_anh: [],
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
    setFormData(initialForm);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      hinh_anh: Array.from(e.target.files || []),
    }));
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("ten", formData.ten);
    payload.append("dia_chi", formData.dia_chi);
    payload.append("phuong_xa", formData.phuong_xa);
    payload.append("tinh_thanh", formData.tinh_thanh);
    if (formData.vi_do !== "") payload.append("vi_do", formData.vi_do);
    if (formData.kinh_do !== "") payload.append("kinh_do", formData.kinh_do);
    payload.append("mo_ta", formData.mo_ta);

    formData.hinh_anh.forEach((file) => {
      payload.append("hinh_anh", file);
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setConfirmState({
      open: true,
      title: editingFacility ? "Xác nhận sửa cơ sở" : "Xác nhận tạo cơ sở",
      message: editingFacility
        ? `Bạn chắc chắn muốn sửa cơ sở "${formData.ten}"?`
        : `Bạn chắc chắn muốn tạo cơ sở "${formData.ten}"?`,
      confirmText: editingFacility ? "Sửa cơ sở" : "Tạo cơ sở",
      danger: false,
      action: () => saveFacility(),
    });
  };

  const saveFacility = async () => {
    setIsLoading(true);
    try {
      if (editingFacility) {
        await api.put(`/co-so/${editingFacility.id}`, buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Cập nhật cơ sở thành công", "success");
      } else {
        await api.post("/co-so", buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Tạo cơ sở thành công, đang chờ admin duyệt", "success");
      }

      setConfirmState((prev) => ({ ...prev, open: false }));
      closeModal();
      fetchFacilities();
    } catch (err) {
      const message = err.response?.data?.message || "Không thể lưu cơ sở";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (facility) => {
    setConfirmState({
      open: true,
      title: "Xác nhận xóa cơ sở",
      message: `Bạn chắc chắn muốn xóa cơ sở "${facility.ten}"?`,
      confirmText: "Xóa cơ sở",
      danger: true,
      action: () => deleteFacility(facility),
    });
  };

  const deleteFacility = async (facility) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.delete(`/co-so/${facility.id}`);
      showToast(res.data.message || "Xóa cơ sở thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchFacilities();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể xóa cơ sở", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (facility) => {
    setConfirmState({
      open: true,
      title: "Xác nhận khôi phục cơ sở",
      message: `Bạn chắc chắn muốn khôi phục cơ sở "${facility.ten}"?`,
      confirmText: "Khôi phục",
      danger: false,
      action: () => restoreFacility(facility),
    });
  };

  const restoreFacility = async (facility) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.patch(`/co-so/${facility.id}/khoi-phuc`);
      showToast(res.data.message || "Khôi phục cơ sở thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchFacilities();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể khôi phục cơ sở",
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
          <h2 className="text-2xl font-bold text-[#0a192f]">Cơ sở của tôi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh sách cơ sở cầu lông bạn đang sở hữu
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto justify-center bg-[#349DFF] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Thêm cơ sở
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex sm:inline-flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setStatusFilter(1)}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
            statusFilter === 1
              ? "bg-[#349DFF] text-white"
              : "text-gray-600 hover:bg-[#eef3ff]"
          }`}
        >
          Đang quản lý
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(0)}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
            statusFilter === 0
              ? "bg-[#349DFF] text-white"
              : "text-gray-600 hover:bg-[#eef3ff]"
          }`}
        >
          Đã xóa
        </button>
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
                <th className="px-6 py-4 whitespace-nowrap">Địa chỉ</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">
                  Số sân
                </th>
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
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {statusFilter === 1
                      ? "Chưa có cơ sở nào"
                      : "Không có cơ sở đã xóa"}
                  </td>
                </tr>
              ) : (
                facilities.map((facility) => {
                  const badge = getTrangThaiCoSo(
                    facility.trang_thai,
                    facility.trang_thai_duyet,
                  );
                  return (
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
                      <td className="px-6 py-4 font-medium text-gray-500">
                        #{facility.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#0a192f]">
                        {facility.ten}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {facility.dia_chi}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-700">
                        {facility.so_san || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {statusFilter === 1 ? (
                          <>
                            <button
                              onClick={() => openEditModal(facility)}
                              className="text-gray-400 hover:text-[#349DFF] hover:bg-[#eef3ff] w-8 h-8 rounded-lg transition-colors mr-1"
                              title="Chỉnh sửa"
                            >
                              <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(facility)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(facility)}
                            className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-green-200 text-xs font-medium"
                            title="Khôi phục"
                          >
                            Khôi phục
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-32px)] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-lg font-bold text-[#0a192f]">
                {editingFacility ? "Sửa cơ sở" : "Thêm cơ sở"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Tên cơ sở *</label>
                  <input
                    name="ten"
                    value={formData.ten}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                    required
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Địa chỉ *</label>
                  <input
                    name="dia_chi"
                    value={formData.dia_chi}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phường xã *</label>
                  <input
                    name="phuong_xa"
                    value={formData.phuong_xa}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tỉnh thành *</label>
                  <input
                    name="tinh_thanh"
                    value={formData.tinh_thanh}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Vĩ độ</label>
                  <input
                    name="vi_do"
                    value={formData.vi_do}
                    onChange={handleChange}
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="Ví dụ: 13.7666"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Kinh độ</label>
                  <input
                    name="kinh_do"
                    value={formData.kinh_do}
                    onChange={handleChange}
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="Ví dụ: 109.2237"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  />
                </div>

                <p className="md:col-span-2 text-xs font-medium text-gray-500">
                  Bỏ trống tọa độ để hệ thống tự lấy theo địa chỉ. Nếu bản đồ
                  lệch, bạn có thể nhập tọa độ thủ công từ Google Maps.
                </p>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ảnh cơ sở</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea
                    name="mo_ta"
                    value={formData.mo_ta}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF] resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 disabled:opacity-70"
                >
                  {isLoading ? "Đang lưu..." : "Lưu cơ sở"}
                </button>
              </div>
            </form>
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
