import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const initialNewConfig = {
  key_name: "",
  key_value: "",
  mo_ta: "",
};

export default function SystemConfig() {
  const [configs, setConfigs] = useState([]);
  const [values, setValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConfig, setNewConfig] = useState(initialNewConfig);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    danger: false,
    action: null,
  });

  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/cau-hinh");
      setConfigs(res.data);
      setValues(
        res.data.reduce((acc, item) => {
          acc[item.key_name] = item.key_value;
          return acc;
        }, {}),
      );
    } catch (err) {
      const message =
        err.response?.data?.message || "Không thể tải cấu hình hệ thống";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConfigs();
  }, [fetchConfigs]);

  const filteredConfigs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return configs;
    return configs.filter((config) =>
      [config.key_name, config.mo_ta]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [configs, searchText]);

  const changedConfigs = useMemo(
    () =>
      configs.filter((config) => values[config.key_name] !== config.key_value),
    [configs, values],
  );

  const handleValueChange = (key_name, value) => {
    setValues((prev) => ({ ...prev, [key_name]: value }));
  };

  const handleSave = () => {
    if (changedConfigs.length === 0) {
      showToast("Chưa có thay đổi nào để lưu", "error");
      return;
    }

    setConfirmState({
      open: true,
      title: "Xác nhận lưu cấu hình",
      message: `Bạn chắc chắn muốn lưu ${changedConfigs.length} thay đổi cấu hình hệ thống?`,
      confirmText: "Lưu thay đổi",
      danger: false,
      action: () => saveConfigs(),
    });
  };

  const saveConfigs = async () => {
    setIsSaving(true);
    try {
      const danh_sach = changedConfigs.map((config) => ({
        key_name: config.key_name,
        key_value: values[config.key_name],
      }));

      await api.patch("/cau-hinh", { danh_sach });
      showToast("Cập nhật cấu hình thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchConfigs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể lưu cấu hình",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setValues(
      configs.reduce((acc, item) => {
        acc[item.key_name] = item.key_value;
        return acc;
      }, {}),
    );
  };

  const handleNewConfigChange = (e) => {
    const { name, value } = e.target;
    setNewConfig((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setNewConfig(initialNewConfig);
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setNewConfig(initialNewConfig);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post("/cau-hinh", newConfig);
      showToast("Thêm cấu hình thành công", "success");
      closeCreateModal();
      fetchConfigs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể thêm cấu hình",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (config) => {
    setConfirmState({
      open: true,
      title: "Xác nhận xóa cấu hình",
      message: `Bạn chắc chắn muốn xóa cấu hình "${config.key_name}"?`,
      confirmText: "Xóa cấu hình",
      danger: true,
      action: () => deleteConfig(config),
    });
  };

  const deleteConfig = async (config) => {
    setIsSaving(true);
    try {
      await api.delete(`/cau-hinh/${config.key_name}`);
      showToast("Xóa cấu hình thành công", "success");
      setConfirmState((prev) => ({ ...prev, open: false }));
      fetchConfigs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Không thể xóa cấu hình",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Cấu hình hệ thống
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các thông số cấu hình chung của toàn hệ thống
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto justify-center bg-[#349DFF] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Thêm cấu hình
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo tên khóa hoặc mô tả"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {isLoading && filteredConfigs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Không có cấu hình phù hợp
          </div>
        ) : (
          filteredConfigs.map((config) => {
            const isChanged = values[config.key_name] !== config.key_value;
            return (
              <div
                key={config.key_name}
                className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4"
              >
                <div className="md:w-1/3">
                  <div className="font-bold text-[#0a192f] flex items-center gap-2">
                    {config.key_name}
                    {isChanged && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        đã sửa
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {config.mo_ta || "Chưa có mô tả"}
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={values[config.key_name] ?? ""}
                    onChange={(e) =>
                      handleValueChange(config.key_name, e.target.value)
                    }
                    className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#349DFF] ${
                      isChanged ? "border-amber-400 bg-amber-50" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(config)}
                    title="Xóa cấu hình"
                    className="w-10 h-10 shrink-0 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {changedConfigs.length > 0 && (
        <div className="sticky bottom-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4">
          <span className="text-sm text-gray-600 font-medium">
            Bạn có {changedConfigs.length} thay đổi chưa lưu
          </span>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-70"
            >
              Hủy thay đổi
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 disabled:opacity-70"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#0a192f]">
                  Thêm cấu hình mới
                </h3>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khóa (key_name)
                  </label>
                  <input
                    name="key_name"
                    value={newConfig.key_name}
                    onChange={handleNewConfigChange}
                    required
                    placeholder="vd: thoi_gian_giu_cho_phut"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị (key_value)
                  </label>
                  <input
                    name="key_value"
                    value={newConfig.key_value}
                    onChange={handleNewConfigChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="mo_ta"
                    value={newConfig.mo_ta}
                    onChange={handleNewConfigChange}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
                  />
                </div>
              </div>
              <div className="px-6 py-4 flex justify-end gap-3 bg-[#f8fafc]">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-70"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-all disabled:opacity-70"
                >
                  {isSaving ? "Đang lưu..." : "Thêm cấu hình"}
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
        loading={isSaving}
        onConfirm={() => confirmState.action?.()}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
