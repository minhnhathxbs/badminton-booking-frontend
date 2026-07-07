import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const initialForm = {
  ten: "",
  mo_ta: "",
};

export default function ManageCourtCategories() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(1);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    danger: false,
    action: null,
  });

  const filteredCategories = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      [category.ten, category.mo_ta]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [categories, searchText]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/danh-muc-san?trang_thai=${statusFilter}`);
      setCategories(res.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Không thể tải danh mục sân";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      ten: category.ten || "",
      mo_ta: category.mo_ta || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    setConfirmState({
      open: true,
      title: editingCategory
        ? "Xác nhận sửa danh mục"
        : "Xác nhận thêm danh mục",
      message: editingCategory
        ? `Bạn chắc chắn muốn sửa danh mục "${formData.ten}"?`
        : `Bạn chắc chắn muốn thêm danh mục "${formData.ten}"?`,
      confirmText: editingCategory ? "Sửa danh mục" : "Thêm danh mục",
      danger: false,
      action: () => saveCategory(),
    });
  };

  const saveCategory = async () => {
    setIsLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/danh-muc-san/${editingCategory.id}`, formData);
        showToast("Cập nhật danh mục sân thành công", "success");
      } else {
        await api.post("/danh-muc-san", formData);
        showToast("Thêm danh mục sân thành công", "success");
      }

      setConfirmState((prev) => ({ ...prev, open: false }));
      closeModal();
      fetchCategories();
    } catch (err) {
      const message = err.response?.data?.message || "Không thể lưu danh mục sân";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (category) => {
    setConfirmState({
      open: true,
      title: "Xác nhận xóa danh mục",
      message: `Bạn chắc chắn muốn xóa danh mục "${category.ten}"?`,
      confirmText: "Xóa danh mục",
      danger: true,
      action: () => deleteCategory(category),
    });
  };

  const deleteCategory = async (category) => {
    setIsLoading(true);
    try {
      const res = await api.delete(`/danh-muc-san/${category.id}`);
      showToast(res.data.message || "Xóa danh mục sân thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchCategories();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể xóa danh mục sân",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (category) => {
    setConfirmState({
      open: true,
      title: "Xác nhận khôi phục danh mục",
      message: `Bạn chắc chắn muốn khôi phục danh mục "${category.ten}"?`,
      confirmText: "Khôi phục",
      danger: false,
      action: () => restoreCategory(category),
    });
  };

  const restoreCategory = async (category) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/danh-muc-san/${category.id}/khoi-phuc`);
      showToast(
        res.data.message || "Khôi phục danh mục sân thành công",
        "success",
      );
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchCategories();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể khôi phục danh mục sân",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Danh mục sân
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý loại sân để dùng khi thêm sân và cấu hình bảng giá
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto justify-center bg-[#349DFF] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Thêm danh mục
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
          Đang dùng
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <i className="fa-solid fa-magnifying-glass text-sm leading-none"></i>
          </span>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm tên hoặc mô tả danh mục"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
          />
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
                <th className="px-6 py-4 whitespace-nowrap">Mã danh mục</th>
                <th className="px-6 py-4 whitespace-nowrap">Tên danh mục</th>
                <th className="px-6 py-4 whitespace-nowrap">Mô tả</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Không có danh mục sân phù hợp
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-500">
                      #{category.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0a192f]">
                      {category.ten}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-md">
                      {category.mo_ta || "Chưa có mô tả"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {statusFilter === 1 ? (
                        <>
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-gray-400 hover:text-[#349DFF] hover:bg-[#eef3ff] w-8 h-8 rounded-lg transition-colors mr-1"
                            title="Chỉnh sửa"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(category)}
                          className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-green-200 text-xs font-medium"
                          title="Khôi phục"
                        >
                          Khôi phục
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-lg font-bold text-[#0a192f]">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên danh mục *</label>
                <input
                  name="ten"
                  value={formData.ten}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mô tả</label>
                <textarea
                  name="mo_ta"
                  value={formData.mo_ta}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF] resize-none"
                ></textarea>
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
                  {isLoading ? "Đang lưu..." : "Lưu danh mục"}
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
