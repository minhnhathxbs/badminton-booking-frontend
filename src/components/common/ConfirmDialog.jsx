export default function ConfirmDialog({
  open,
  title = "Xác nhận thao tác",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 modal-overlay">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden modal-box">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#0a192f]">{title}</h3>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3 bg-[#f8fafc]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-70"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-70 ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#349DFF] hover:bg-blue-600"
            }`}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
