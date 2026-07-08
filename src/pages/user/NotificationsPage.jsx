import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/common/UserHeader";
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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    danhSach,
    soChuaDoc,
    dangTai,
    taiThongBao,
    danhDauDaDoc,
    danhDauTatCa,
    xoaThongBao,
    xoaTatCaDaDoc,
  } = useNotifications();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/dang-nhap");
      return;
    }
    taiThongBao();
  }, [navigate, taiThongBao]);

  const xuLyClick = (tb) => {
    if (!tb.da_doc) danhDauDaDoc(tb.id);
    if (tb.duong_dan) navigate(tb.duong_dan);
  };

  const coDaDoc = danhSach.some((tb) => tb.da_doc);

  return (
    <div className="min-h-screen bg-[#f4f8ff] font-sans text-gray-800">
      <UserHeader />
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-7 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Thông báo
            {soChuaDoc > 0 && (
              <span className="ml-2 text-sm font-medium text-red-500">
                ({soChuaDoc} chưa đọc)
              </span>
            )}
          </h1>
          <div className="flex items-center gap-3">
            {soChuaDoc > 0 && (
              <button
                type="button"
                onClick={danhDauTatCa}
                className="text-sm text-blue-600 hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
            {coDaDoc && (
              <button
                type="button"
                onClick={xoaTatCaDaDoc}
                className="text-sm text-red-500 hover:underline"
              >
                Xóa đã đọc
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-50">
          {dangTai && danhSach.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400">
              Đang tải...
            </div>
          ) : danhSach.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400">
              <i className="fa-regular fa-bell-slash text-3xl mb-2 block"></i>
              Chưa có thông báo nào!
            </div>
          ) : (
            danhSach.map((tb) => (
              <div
                key={tb.id}
                className={`w-full flex gap-3 px-4 py-4 hover:bg-gray-50 transition-colors ${
                  tb.da_doc ? "bg-white" : "bg-blue-50/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => xuLyClick(tb)}
                  className="flex gap-3 flex-1 text-left min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-[#eef3ff] text-blue-600 flex items-center justify-center flex-shrink-0">
                    <i className={iconTheoLoai(tb.loai_thong_bao)}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">{tb.tieu_de}</p>
                    <p className="text-sm text-gray-500">{tb.noi_dung}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {thoiGianTuongDoi(tb.ngay_tao)}
                    </p>
                  </div>
                  {!tb.da_doc && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => xoaThongBao(tb.id)}
                  className="ml-1 flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors self-center p-1 rounded"
                  title="Xóa thông báo"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
