import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/notificationStore";

const thoiGianTuongDoi = (ngay) => {
  const t = new Date(ngay).getTime();
  if (Number.isNaN(t)) return "";
  const giay = Math.floor((Date.now() - t) / 1000);
  if (giay < 60) return "Vừa xong";
  if (giay < 3600) return `${Math.floor(giay / 60)} phút trước`;
  if (giay < 86400) return `${Math.floor(giay / 3600)} giờ trước`;
  return `${Math.floor(giay / 86400)} ngày trước`;
};

const iconTheoLoai = (loai) => {
  if (loai === "THANH_TOAN") return "fa-solid fa-money-bill-wave";
  if (loai === "HOAN_TIEN") return "fa-solid fa-rotate-left";
  if (loai === "CO_SO") return "fa-solid fa-building";
  if (loai === "KHIEU_NAI") return "fa-solid fa-flag";
  if (loai === "DANH_GIA") return "fa-solid fa-star";
  return "fa-solid fa-calendar-check";
};

export default function NotificationBell({ className = "" }) {
  const { danhSach, soChuaDoc, danhDauDaDoc, danhDauTatCa } =
    useNotifications();
  const [moMenu, setMoMenu] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setMoMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const xuLyClick = (tb) => {
    if (!tb.da_doc) danhDauDaDoc(tb.id);
    setMoMenu(false);
    if (tb.duong_dan) navigate(tb.duong_dan);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setMoMenu((v) => !v)}
        className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
        aria-label="Thông báo"
      >
        <i className="fa-regular fa-bell text-lg"></i>
        {soChuaDoc > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {soChuaDoc > 99 ? "99+" : soChuaDoc}
          </span>
        )}
      </button>

      {moMenu && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-gray-800">Thông báo</p>
            {soChuaDoc > 0 && (
              <button
                type="button"
                onClick={danhDauTatCa}
                className="text-xs text-blue-600 hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {danhSach.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                <i className="fa-regular fa-bell-slash text-2xl mb-2 block"></i>
                Chưa có thông báo nào
              </div>
            ) : (
              danhSach.map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => xuLyClick(tb)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    tb.da_doc ? "bg-white" : "bg-blue-50/60"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#eef3ff] text-blue-600 flex items-center justify-center flex-shrink-0">
                    <i className={iconTheoLoai(tb.loai_thong_bao)}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {tb.tieu_de}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {tb.noi_dung}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {thoiGianTuongDoi(tb.ngay_tao)}
                    </p>
                  </div>
                  {!tb.da_doc && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
