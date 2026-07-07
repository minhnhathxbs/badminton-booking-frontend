import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const GIOI_HAN = 20;

const VAI_TRO_LABEL = {
  0: "Người chơi",
  1: "Chủ sân",
  2: "Admin",
};

const formatNgay = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const formatChiTiet = (chi_tiet) => {
  if (!chi_tiet) return "—";
  try {
    return JSON.stringify(JSON.parse(chi_tiet), null, 2);
  } catch {
    return chi_tiet;
  }
};

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [hanhDongList, setHanhDongList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [hanhDong, setHanhDong] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");

  const [trang, setTrang] = useState(1);
  const [tongSo, setTongSo] = useState(0);
  const [tongSoTrang, setTongSoTrang] = useState(1);

  const [selectedLog, setSelectedLog] = useState(null);

  const searchTimer = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setTuKhoa(searchInput);
      setTrang(1);
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  const fetchHanhDong = useCallback(async () => {
    try {
      const res = await api.get("/nhat-ky/hanh-dong");
      setHanhDongList(res.data);
    } catch {
      // không chặn luồng chính nếu không tải được danh sách hành động
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHanhDong();
  }, [fetchHanhDong]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = {
        tu_khoa: tuKhoa,
        trang,
        gioi_han: GIOI_HAN,
      };
      if (tuNgay) params.tu_ngay = `${tuNgay} 00:00:00`;
      if (denNgay) params.den_ngay = `${denNgay} 23:59:59`;

      const res = await api.get("/nhat-ky", { params });
      let danhSach = res.data.danh_sach ?? [];

      if (hanhDong) {
        danhSach = danhSach.filter((log) => log.hanh_dong === hanhDong);
      }

      setLogs(danhSach);
      setTongSo(res.data.tong ?? 0);
      setTongSoTrang(Math.max(1, Math.ceil((res.data.tong ?? 0) / GIOI_HAN)));
    } catch (err) {
      const message =
        err.response?.data?.message || "Không thể tải nhật ký hệ thống";
      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [tuKhoa, hanhDong, tuNgay, denNgay, trang]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilter = () => {
    setSearchInput("");
    setTuKhoa("");
    setHanhDong("");
    setTuNgay("");
    setDenNgay("");
    setTrang(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0a192f]">Nhật ký hệ thống</h2>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi lịch sử hoạt động của người dùng trên toàn hệ thống
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <i className="fa-solid fa-magnifying-glass text-sm leading-none"></i>
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm hành động, chi tiết, người dùng"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
          />
        </div>
        <select
          value={hanhDong}
          onChange={(e) => {
            setHanhDong(e.target.value);
            setTrang(1);
          }}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] bg-white"
        >
          <option value="">Tất cả hành động</option>
          {hanhDongList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={tuNgay}
          onChange={(e) => {
            setTuNgay(e.target.value);
            setTrang(1);
          }}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={denNgay}
            onChange={(e) => {
              setDenNgay(e.target.value);
              setTrang(1);
            }}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF]"
          />
          <button
            type="button"
            onClick={handleResetFilter}
            title="Xóa bộ lọc"
            className="w-11 shrink-0 rounded-xl text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
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
                <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                <th className="px-6 py-4 whitespace-nowrap">Người dùng</th>
                <th className="px-6 py-4 whitespace-nowrap">Hành động</th>
                <th className="px-6 py-4 whitespace-nowrap">Chi tiết</th>
                <th className="px-6 py-4 whitespace-nowrap">IP</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Không có nhật ký phù hợp
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatNgay(log.ngay_tao)}
                    </td>
                    <td className="px-6 py-4">
                      {log.nguoi_dung_id ? (
                        <div>
                          <div className="font-bold text-[#0a192f]">
                            {log.ten_nguoi_dung || `#${log.nguoi_dung_id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.email_nguoi_dung}
                            {log.vai_tro_id != null &&
                              ` · ${VAI_TRO_LABEL[log.vai_tro_id] ?? ""}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Hệ thống / Ẩn danh</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#eef3ff] text-[#349DFF]">
                        {log.hanh_dong}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {log.chi_tiet || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {log.ip_address || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="w-9 h-9 rounded-xl text-[#349DFF] hover:bg-[#eef3ff] transition-colors"
                        title="Xem chi tiết"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Tổng {tongSo} bản ghi · Trang {trang}/{tongSoTrang}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={trang <= 1}
              onClick={() => setTrang((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={trang >= tongSoTrang}
              onClick={() => setTrang((p) => Math.min(tongSoTrang, p + 1))}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0a192f]">
                Chi tiết nhật ký #{selectedLog.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Thời gian</span>
                <span className="font-medium text-[#0a192f]">
                  {formatNgay(selectedLog.ngay_tao)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Người dùng</span>
                <span className="font-medium text-[#0a192f] text-right">
                  {selectedLog.ten_nguoi_dung || "Hệ thống / Ẩn danh"}
                  {selectedLog.email_nguoi_dung && (
                    <div className="text-xs text-gray-500 font-normal">
                      {selectedLog.email_nguoi_dung}
                    </div>
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Hành động</span>
                <span className="font-medium text-[#349DFF]">
                  {selectedLog.hanh_dong}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">IP</span>
                <span className="font-medium text-[#0a192f]">
                  {selectedLog.ip_address || "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Chi tiết</span>
                <pre className="mt-1 bg-[#f8fafc] border border-gray-200 rounded-xl p-3 text-xs text-gray-700 whitespace-pre-wrap break-all">
                  {formatChiTiet(selectedLog.chi_tiet)}
                </pre>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
