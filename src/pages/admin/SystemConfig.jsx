import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

const systemConfigKeys = new Set([
  "THOI_GIAN_GIU_CHO_PHUT",
  "HOAN_TIEN_MOC_CAO_NHAT_GIO",
  "HOAN_TIEN_MOC_CAO_NHAT_PHAN_TRAM",
  "HOAN_TIEN_MOC_TRUNG_GIAN_GIO",
  "HOAN_TIEN_MOC_TRUNG_GIAN_PHAN_TRAM",
  "HOAN_TIEN_DUOI_MOC_TRUNG_GIAN_PHAN_TRAM",
  "SO_GIO_TRUOC_KHI_CHOI_DUOC_DANH_GIA",
]);

const systemConfigDisplay = {
  THOI_GIAN_GIU_CHO_PHUT: {
    label: "Thời gian giữ chỗ",
    description: "Số phút giữ chỗ tạm thời trước khi đơn hết hạn nếu chưa thanh toán.",
  },
  HOAN_TIEN_MOC_CAO_NHAT_GIO: {
    label: "Mốc giờ hoàn tiền cao nhất",
    description: "Khách hủy trước giờ chơi từ mốc này trở lên sẽ nhận mức hoàn tiền cao nhất.",
  },
  HOAN_TIEN_MOC_CAO_NHAT_PHAN_TRAM: {
    label: "Phần trăm hoàn tiền cao nhất",
    description: "Tỷ lệ hoàn tiền áp dụng khi khách đạt mốc giờ hoàn tiền cao nhất.",
  },
  HOAN_TIEN_MOC_TRUNG_GIAN_GIO: {
    label: "Mốc giờ hoàn tiền trung gian",
    description: "Khách hủy trước giờ chơi từ mốc này trở lên nhưng chưa đạt mốc cao nhất sẽ nhận mức hoàn tiền trung gian.",
  },
  HOAN_TIEN_MOC_TRUNG_GIAN_PHAN_TRAM: {
    label: "Phần trăm hoàn tiền trung gian",
    description: "Tỷ lệ hoàn tiền áp dụng khi khách đạt mốc giờ hoàn tiền trung gian.",
  },
  HOAN_TIEN_DUOI_MOC_TRUNG_GIAN_PHAN_TRAM: {
    label: "Phần trăm hoàn tiền dưới mốc trung gian",
    description: "Tỷ lệ hoàn tiền khi khách hủy dưới mốc giờ trung gian nhưng vẫn trước giờ chơi.",
  },
  SO_GIO_TRUOC_KHI_CHOI_DUOC_DANH_GIA: {
    label: "Thời gian chờ trước khi đánh giá",
    description: "Số giờ sau khi kết thúc giờ chơi thì khách mới được đánh giá, nhập 0 để cho đánh giá ngay.",
  },
};

const systemConfigGuide = [
  "THOI_GIAN_GIU_CHO_PHUT",
  "HOAN_TIEN_MOC_CAO_NHAT_GIO",
  "HOAN_TIEN_MOC_CAO_NHAT_PHAN_TRAM",
  "HOAN_TIEN_MOC_TRUNG_GIAN_GIO",
  "HOAN_TIEN_MOC_TRUNG_GIAN_PHAN_TRAM",
  "HOAN_TIEN_DUOI_MOC_TRUNG_GIAN_PHAN_TRAM",
  "SO_GIO_TRUOC_KHI_CHOI_DUOC_DANH_GIA",
];

const getConfigUnit = (keyName) => {
  if (keyName === "THOI_GIAN_GIU_CHO_PHUT") return "phút";
  if (keyName.endsWith("_GIO")) return "h";
  if (keyName.endsWith("_PHAN_TRAM")) return "%";
  return "";
};

const getConfigValidationMessage = (keyName, value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `Giá trị cấu hình "${keyName}" là bắt buộc`;
  }

  const rawValue = String(value).trim();
  const numberValue = Number(rawValue);

  if (systemConfigKeys.has(keyName) && !Number.isFinite(numberValue)) {
    return `Giá trị cấu hình "${keyName}" phải là số hợp lệ`;
  }

  if (
    keyName === "THOI_GIAN_GIU_CHO_PHUT" &&
    (!Number.isInteger(numberValue) || numberValue <= 0)
  ) {
    return "THOI_GIAN_GIU_CHO_PHUT phải là số nguyên lớn hơn 0";
  }

  if (
    ["HOAN_TIEN_MOC_CAO_NHAT_GIO", "HOAN_TIEN_MOC_TRUNG_GIAN_GIO"].includes(keyName) &&
    numberValue < 0
  ) {
    return `${keyName} phai lon hon hoac bang 0`;
  }

  if (
    [
      "HOAN_TIEN_MOC_CAO_NHAT_PHAN_TRAM",
      "HOAN_TIEN_MOC_TRUNG_GIAN_PHAN_TRAM",
      "HOAN_TIEN_DUOI_MOC_TRUNG_GIAN_PHAN_TRAM",
    ].includes(keyName) &&
    (numberValue < 0 || numberValue > 100)
  ) {
    return `${keyName} phai nam trong khoang 0-100`;
  }

  if (keyName === "SO_GIO_TRUOC_KHI_CHOI_DUOC_DANH_GIA" && numberValue < 0) {
    return "SO_GIO_TRUOC_KHI_CHOI_DUOC_DANH_GIA phải lớn hơn hoặc bằng 0";
  }

  return "";
};

export default function SystemConfig() {
  const [configs, setConfigs] = useState([]);
  const [values, setValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
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
    return configs.filter((config) => {
      const displayInfo = systemConfigDisplay[config.key_name];
      return [config.key_name, config.key_value, config.mo_ta, displayInfo?.label, displayInfo?.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
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

    const invalidConfig = changedConfigs.find((config) =>
      getConfigValidationMessage(config.key_name, values[config.key_name]),
    );
    if (invalidConfig) {
      showToast(
        getConfigValidationMessage(
          invalidConfig.key_name,
          values[invalidConfig.key_name],
        ),
        "error",
      );
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
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-sm text-blue-900">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-circle-info"></i>
          Các khóa cấu hình đang được hệ thống sử dụng
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {systemConfigGuide.map((keyName) => {
            const displayInfo = systemConfigDisplay[keyName];
            return (
              <div
                key={keyName}
                className="rounded-xl bg-white/70 border border-blue-100 px-3 py-2"
              >
                <div className="font-semibold text-blue-950">
                  {displayInfo.label}
                </div>
                <div className="text-xs text-blue-700 break-all mt-0.5">
                  {keyName}
                </div>
                <div className="text-xs text-blue-800 mt-1">
                  {displayInfo.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <i className="fa-solid fa-magnifying-glass text-sm leading-none"></i>
          </span>
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
            const isSystemConfig = systemConfigKeys.has(config.key_name);
            const displayInfo = systemConfigDisplay[config.key_name];
            const unit = getConfigUnit(config.key_name);
            return (
              <div
                key={config.key_name}
                className="flex flex-col md:flex-row md:items-center gap-3 px-6 py-4"
              >
                <div className="md:w-1/3">
                  <div className="font-bold text-[#0a192f] flex items-center gap-2">
                    {displayInfo?.label || config.key_name}
                    {isChanged && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        đã sửa
                      </span>
                    )}
                  </div>
                  {displayInfo && (
                    <div className="text-[11px] text-gray-400 mt-0.5 break-all">
                      {config.key_name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {displayInfo?.description || config.mo_ta || "Chua co mo ta"}
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 md:justify-end">
                  <div className="relative w-full md:w-40">
                    <input
                      value={values[config.key_name] ?? ""}
                      onChange={(e) =>
                        handleValueChange(config.key_name, e.target.value)
                      }
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-[#349DFF] ${
                        unit ? "pr-14" : ""
                      } ${
                        isChanged ? "border-amber-400 bg-amber-50" : "border-gray-200"
                      }`}
                    />
                    {unit && (
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-gray-400">
                        {unit}
                      </span>
                    )}
                  </div>
                  {!isSystemConfig && (
                    <button
                      type="button"
                      onClick={() => handleDelete(config)}
                      title="Xóa cấu hình"
                      className="w-10 h-10 shrink-0 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
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
              {"Hủy"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md shadow-blue-200 disabled:opacity-70"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
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
