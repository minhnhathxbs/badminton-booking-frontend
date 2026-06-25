import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [thongKe, setThongKe] = useState({
    tong_danh_gia: 0,
    diem_trung_binh: 0,
    chua_phan_hoi: 0,
  });
  const [danhSachCoSo, setDanhSachCoSo] = useState([]);
  const [trang, setTrang] = useState(1);
  const [tong, setTong] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [coSoId, setCoSoId] = useState("");
  const [trangThaiPhanHoi, setTrangThaiPhanHoi] = useState("");

  // Modal phản hồi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal báo cáo
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReview, setReportReview] = useState(null);
  const [reportReason, setReportReason] = useState("");

  const gioiHan = 10;

  const fetchCoSo = useCallback(async () => {
    try {
      const res = await api.get("/danh-gia/chu-san/co-so");
      setDanhSachCoSo(res.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchThongKe = useCallback(async () => {
    try {
      const params = {};
      if (coSoId) params.co_so_id = coSoId;
      const res = await api.get("/danh-gia/chu-san/thong-ke", { params });
      setThongKe(res.data);
    } catch {
      // ignore
    }
  }, [coSoId]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { trang, gioi_han: gioiHan };
      if (coSoId) params.co_so_id = coSoId;
      if (trangThaiPhanHoi) params.trang_thai_phan_hoi = trangThaiPhanHoi;

      const res = await api.get("/danh-gia/chu-san", { params });
      setReviews(res.data.danh_sach);
      setTong(res.data.tong);
    } catch {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [trang, coSoId, trangThaiPhanHoi]);

  useEffect(() => {
    fetchCoSo();
  }, [fetchCoSo]);

  useEffect(() => {
    fetchThongKe();
  }, [fetchThongKe]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset trang khi đổi bộ lọc
  useEffect(() => {
    setTrang(1);
  }, [coSoId, trangThaiPhanHoi]);

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyContent(review.phan_hoi_chu_san || "");
    setIsModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/danh-gia/${selectedReview.id}/phan-hoi`, {
        noi_dung: replyContent,
      });
      toast.success("Phản hồi đánh giá thành công");
      setIsModalOpen(false);
      fetchReviews();
      fetchThongKe();
    } catch (err) {
      toast.error(err.response?.data?.message || "Phản hồi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReportModal = (review) => {
    setReportReview(review);
    setReportReason("");
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    setSubmitting(true);
    try {
      await api.post(`/danh-gia/${reportReview.id}/bao-cao`, {
        ly_do: reportReason,
      });
      toast.success("Đã báo cáo đánh giá vi phạm");
      setIsReportModalOpen(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Báo cáo thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star text-[13px] ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
      ></i>
    ));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tongTrang = Math.ceil(tong / gioiHan);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Quản lý đánh giá
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi và phản hồi nhận xét từ khách hàng
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={coSoId}
            onChange={(e) => setCoSoId(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="">Tất cả cơ sở</option>
            {danhSachCoSo.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.ten}
              </option>
            ))}
          </select>
          <select
            value={trangThaiPhanHoi}
            onChange={(e) => setTrangThaiPhanHoi(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="">Mọi trạng thái</option>
            <option value="chua_phan_hoi">Chưa phản hồi</option>
            <option value="da_phan_hoi">Đã phản hồi</option>
          </select>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-star"></i>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">
              Điểm trung bình
            </div>
            <div className="text-2xl font-bold text-[#0a192f]">
              {thongKe.diem_trung_binh}{" "}
              <span className="text-sm font-normal text-gray-500">/ 5.0</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#349DFF] flex items-center justify-center text-xl">
            <i className="fa-regular fa-comment-dots"></i>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">
              Tổng đánh giá
            </div>
            <div className="text-2xl font-bold text-[#0a192f]">
              {thongKe.tong_danh_gia}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">
            <i className="fa-solid fa-reply"></i>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">
              Chưa phản hồi
            </div>
            <div className="text-2xl font-bold text-red-500">
              {thongKe.chua_phan_hoi}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Đang tải dữ liệu...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Chưa có đánh giá nào
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                    {review.ten_khach_hang?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="font-bold text-[#0a192f]">
                      {review.ten_khach_hang}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(review.ngay_tao)} • {review.ten_co_so}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">{renderStars(review.so_sao)}</div>
              </div>

              <div className="text-gray-700 text-sm mb-4">
                {review.noi_dung}
              </div>

              {review.phan_hoi_chu_san ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-reply text-[#349DFF] text-xs"></i>
                    <span className="font-bold text-sm text-[#0a192f]">
                      Phản hồi của bạn
                    </span>
                    {review.ngay_phan_hoi && (
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDate(review.ngay_phan_hoi)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {review.phan_hoi_chu_san}
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                {review.trang_thai === 1 && (
                  <button
                    onClick={() => handleOpenReportModal(review)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border bg-white text-red-500 border-red-300 hover:bg-red-50"
                  >
                    <i className="fa-solid fa-flag mr-1.5"></i>
                    Báo cáo
                  </button>
                )}
                <button
                  onClick={() => handleOpenReplyModal(review)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    review.phan_hoi_chu_san
                      ? "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      : "bg-[#349DFF] text-white border-transparent hover:bg-blue-600 shadow-sm"
                  }`}
                >
                  {review.phan_hoi_chu_san ? "Sửa phản hồi" : "Phản hồi"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phân trang */}
      {tongTrang > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setTrang((p) => Math.max(1, p - 1))}
            disabled={trang === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {trang} / {tongTrang}
          </span>
          <button
            onClick={() => setTrang((p) => Math.min(tongTrang, p + 1))}
            disabled={trang === tongTrang}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal Phản hồi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-lg font-bold text-[#0a192f]">
                Phản hồi đánh giá
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                <div className="font-medium text-sm text-[#0a192f] mb-1">
                  {selectedReview?.ten_khach_hang}
                </div>
                <div className="flex gap-1 mb-2">
                  {renderStars(selectedReview?.so_sao)}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedReview?.noi_dung}
                </div>
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nhập nội dung phản hồi..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#349DFF] text-sm resize-none"
              ></textarea>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Lưu phản hồi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Báo cáo */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-lg font-bold text-[#0a192f]">
                Báo cáo đánh giá vi phạm
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                <div className="font-medium text-sm text-[#0a192f] mb-1">
                  Đánh giá của: {reportReview?.ten_khach_hang}
                </div>
                <div className="text-sm text-gray-600">
                  "{reportReview?.noi_dung}"
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Bạn muốn báo cáo đánh giá này vì chứa nội dung không phù hợp.
                Hệ thống sẽ gửi cảnh báo tới Admin để xử lý.
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Lý do báo cáo (không bắt buộc)..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-400 text-sm resize-none"
              ></textarea>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
