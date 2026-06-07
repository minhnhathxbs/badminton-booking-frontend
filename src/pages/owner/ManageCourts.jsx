import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const initialForm = {
  co_so_id: "",
  ten: "",
  danh_muc_san_id: "",
  hinh_anh: [],
};

const statusTabs = [
  { value: 1, label: "Hoạt động" },
  { value: 2, label: "Đã khóa" },
  { value: 0, label: "Đã xóa" },
];

const getStatusMeta = (status) => {
  switch (Number(status)) {
    case 0:
      return {
        label: "Đã xóa",
        className: "bg-gray-100 text-gray-600 border border-gray-200",
      };
    case 2:
      return {
        label: "Đã khóa",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    default:
      return {
        label: "Hoạt động",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
  }
};

export default function ManageCourts() {
  const [courts, setCourts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("all");
  const [statusFilter, setStatusFilter] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [editingCourt, setEditingCourt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const approvedFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          Number(facility.trang_thai) === 1 &&
          Number(facility.trang_thai_duyet) === 1,
      ),
    [facilities],
  );

  const filteredCourts = useMemo(() => {
    if (selectedFacility === "all") return courts;
    return courts.filter(
      (court) => Number(court.co_so_id) === Number(selectedFacility),
    );
  }, [courts, selectedFacility]);

  const fetchCourts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/san/cua-toi?trang_thai=${statusFilter}`);
      setCourts(res.data);
    } catch (err) {
      const message = err.response?.data?.message || "Không thể tải danh sách sân";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const fetchOptions = useCallback(async () => {
    try {
      const [facilityRes, categoryRes] = await Promise.all([
        api.get("/co-so/cua-toi?trang_thai=1"),
        api.get("/danh-muc-san"),
      ]);
      setFacilities(facilityRes.data);
      setCategories(categoryRes.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Không thể tải dữ liệu cơ sở hoặc loại sân";
      setError(message);
      showToast(message, "error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourts();
  }, [fetchCourts]);

  const openCreateModal = () => {
    setEditingCourt(null);
    setFormData({
      ...initialForm,
      co_so_id: approvedFacilities[0]?.id || "",
      danh_muc_san_id: categories[0]?.id || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (court) => {
    setEditingCourt(court);
    setFormData({
      co_so_id: court.co_so_id || "",
      ten: court.ten || "",
      danh_muc_san_id: court.danh_muc_san_id || "",
      hinh_anh: [],
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourt(null);
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
    payload.append("co_so_id", formData.co_so_id);
    payload.append("ten", formData.ten);
    payload.append("danh_muc_san_id", formData.danh_muc_san_id);

    formData.hinh_anh.forEach((file) => {
      payload.append("hinh_anh", file);
    });

    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    setConfirmState({
      open: true,
      title: editingCourt ? "Xác nhận sửa sân" : "Xác nhận thêm sân",
      message: editingCourt
        ? `Bạn chắc chắn muốn sửa sân "${formData.ten}"?`
        : `Bạn chắc chắn muốn thêm sân "${formData.ten}"?`,
      confirmText: editingCourt ? "Sửa sân" : "Thêm sân",
      danger: false,
      action: () => saveCourt(),
    });
  };

  const saveCourt = async () => {
    setIsLoading(true);
    try {
      if (editingCourt) {
        await api.put(`/san/${editingCourt.id}`, buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Cập nhật sân thành công", "success");
      } else {
        await api.post("/san", buildPayload(), {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Thêm sân thành công", "success");
      }

      setConfirmState((prev) => ({ ...prev, open: false }));
      closeModal();
      fetchCourts();
    } catch (err) {
      const message = err.response?.data?.message || "Không thể lưu sân";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (court) => {
    setConfirmState({
      open: true,
      title: "Xác nhận xóa sân",
      message: `Bạn chắc chắn muốn xóa sân "${court.ten}"?`,
      confirmText: "Xóa sân",
      danger: true,
      action: () => deleteCourt(court),
    });
  };

  const deleteCourt = async (court) => {
    setIsLoading(true);
    try {
      const res = await api.delete(`/san/${court.id}`);
      showToast(res.data.message || "Xóa sân thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchCourts();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể xóa sân", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (court) => {
    setConfirmState({
      open: true,
      title: "Xác nhận khôi phục sân",
      message: `Bạn chắc chắn muốn khôi phục sân "${court.ten}"?`,
      confirmText: "Khôi phục",
      danger: false,
      action: () => restoreCourt(court),
    });
  };

  const restoreCourt = async (court) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/san/${court.id}/khoi-phuc`);
      showToast(res.data.message || "Khôi phục sân thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchCourts();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể khôi phục sân", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCourtStatus = async (court) => {
    const nextStatus = Number(court.trang_thai) === 1 ? 2 : 1;
    setIsLoading(true);
    try {
      const res = await api.patch(`/san/${court.id}/trang-thai`, {
        trang_thai: nextStatus,
      });
      showToast(res.data.message || "Cập nhật trạng thái sân thành công", "success");
      fetchCourts();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể cập nhật trạng thái sân",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">Danh sách sân</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý sân theo cơ sở, trạng thái hoạt động, khóa và xóa mềm
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="w-full sm:w-56 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] bg-white"
          >
            <option value="all">Tất cả cơ sở</option>
            {approvedFacilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.ten}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreateModal}
            className="w-full sm:w-auto justify-center bg-[#349DFF] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> Thêm sân
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex sm:inline-flex gap-2 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              statusFilter === tab.value
                ? "bg-[#349DFF] text-white"
                : "text-gray-600 hover:bg-[#eef3ff]"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
                <th className="px-6 py-4 whitespace-nowrap">Mã sân</th>
                <th className="px-6 py-4 whitespace-nowrap">Tên sân</th>
                <th className="px-6 py-4 whitespace-nowrap">Cơ sở</th>
                <th className="px-6 py-4 whitespace-nowrap">Loại sân</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Không có sân phù hợp
                  </td>
                </tr>
              ) : (
                filteredCourts.map((court) => {
                  const status = getStatusMeta(court.trang_thai);
                  return (
                    <tr
                      key={court.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                          {court.anh_chinh ? (
                            <img
                              src={getAssetUrl(court.anh_chinh)}
                              alt={court.ten}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500">
                        #{court.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#0a192f]">
                        {court.ten}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {court.ten_co_so}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {court.ten_danh_muc || `#${court.danh_muc_san_id}`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {Number(court.trang_thai) === 0 ? (
                          <button
                            onClick={() => handleRestore(court)}
                            className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-green-200 text-xs font-medium"
                            title="Khôi phục"
                          >
                            Khôi phục
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleCourtStatus(court)}
                              className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 w-8 h-8 rounded-lg transition-colors mr-1"
                              title={
                                Number(court.trang_thai) === 1
                                  ? "Khóa sân"
                                  : "Mở khóa sân"
                              }
                            >
                              <i
                                className={`fa-solid ${
                                  Number(court.trang_thai) === 1
                                    ? "fa-lock"
                                    : "fa-unlock"
                                } text-xs`}
                              ></i>
                            </button>
                            <button
                              onClick={() => openEditModal(court)}
                              className="text-gray-400 hover:text-[#349DFF] hover:bg-[#eef3ff] w-8 h-8 rounded-lg transition-colors mr-1"
                              title="Chỉnh sửa"
                            >
                              <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(court)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </>
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
                {editingCourt ? "Sửa sân" : "Thêm sân"}
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
                  <label className="text-sm font-medium">Tên sân *</label>
                  <input
                    name="ten"
                    value={formData.ten}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cơ sở *</label>
                  <select
                    name="co_so_id"
                    value={formData.co_so_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF] bg-white"
                    required
                  >
                    <option value="">Chọn cơ sở</option>
                    {approvedFacilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.ten}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Loại sân *</label>
                  <select
                    name="danh_muc_san_id"
                    value={formData.danh_muc_san_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF] bg-white"
                    required
                  >
                    <option value="">Chọn loại sân</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.ten}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Ảnh sân</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  />
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
                  {isLoading ? "Đang lưu..." : "Lưu sân"}
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
