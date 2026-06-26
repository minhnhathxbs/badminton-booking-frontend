import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const PAGE_SIZE = 10;

const formatDateTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getCustomerName = (review) =>
  review.ten_khach || review.ten_khach_hang || "Khách hàng";

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [facilityFilter, setFacilityFilter] = useState("");
  const [replyFilter, setReplyFilter] = useState("");
  const [stats, setStats] = useState({
    tong_danh_gia: 0,
    diem_trung_binh: 0,
    chua_phan_hoi: 0,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReview, setReportReview] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await api.get("/danh-gia/chu-san/co-so");
      setFacilities(Array.isArray(res.data) ? res.data : []);
    } catch {
      try {
        const fallback = await api.get("/co-so/cua-toi?trang_thai=1");
        setFacilities(Array.isArray(fallback.data) ? fallback.data : []);
      } catch {
        setFacilities([]);
      }
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (facilityFilter) params.co_so_id = facilityFilter;

      const res = await api.get("/danh-gia/chu-san/thong-ke", { params });
      setStats({
        tong_danh_gia: Number(res.data?.tong_danh_gia || 0),
        diem_trung_binh: Number(res.data?.diem_trung_binh || 0),
        chua_phan_hoi: Number(res.data?.chua_phan_hoi || 0),
      });
    } catch {
      setStats({
        tong_danh_gia: 0,
        diem_trung_binh: 0,
        chua_phan_hoi: 0,
      });
    }
  }, [facilityFilter]);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = { trang: page, gioi_han: PAGE_SIZE };
      if (facilityFilter) params.co_so_id = facilityFilter;
      if (replyFilter) params.trang_thai_phan_hoi = replyFilter;

      const res = await api.get("/danh-gia/chu-san", { params });
      setReviews(Array.isArray(res.data?.danh_sach) ? res.data.danh_sach : []);
      setTotal(Number(res.data?.tong || 0));
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải đánh giá");
      setReviews([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [facilityFilter, page, replyFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFacilities();
  }, [fetchFacilities]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [facilityFilter, replyFilter]);

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyContent(review.phan_hoi_chu_san || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setReplyContent("");
  };

  const handleSubmitReply = async () => {
    if (!selectedReview) return;

    if (!replyContent.trim()) {
      showToast("Vui lòng nhập nội dung phản hồi", "error");
      return;
    }

    setIsSavingReply(true);
    try {
      await api.put(`/chu-san/danh-gia/${selectedReview.id}/phan-hoi`, {
        phan_hoi_chu_san: replyContent,
      });

      showToast("Lưu phản hồi thành công", "success");
      closeModal();
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể lưu phản hồi", "error");
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleOpenReportModal = (review) => {
    setReportReview(review);
    setReportReason("");
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReview) return;

    setIsReporting(true);
    try {
      await api.post(`/danh-gia/${reportReview.id}/bao-cao`, {
        ly_do: reportReason,
      });

      showToast("Đã báo cáo đánh giá vi phạm", "success");
      setIsReportModalOpen(false);
      setReportReview(null);
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err) {
      showToast(err.response?.data?.message || "Báo cáo thất bại", "error");
    } finally {
      setIsReporting(false);
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }).map((_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star text-[13px] ${
          index < Number(rating || 0) ? "text-yellow-400" : "text-gray-300"
        }`}
      ></i>
    ));

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Quản lý đánh giá
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi và phản hồi nhận xét từ khách hàng
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="">Tất cả cơ sở</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.ten}
              </option>
            ))}
          </select>
          <select
            value={replyFilter}
            onChange={(e) => setReplyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="">Mọi trạng thái</option>
            <option value="chua_phan_hoi">Chưa phản hồi</option>
            <option value="da_phan_hoi">Đã phản hồi</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

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
              {isLoading ? "..." : stats.diem_trung_binh}{" "}
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
              {isLoading ? "..." : stats.tong_danh_gia}
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
              {isLoading ? "..." : stats.chua_phan_hoi}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
            Đang tải đánh giá...
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
                    {getCustomerName(review).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#0a192f] truncate">
                      {getCustomerName(review)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDateTime(review.ngay_tao)} · {review.ten_co_so}
                      {review.dat_san_id ? ` · Đơn #${review.dat_san_id}` : ""}
                    </div>
                    {review.so_dien_thoai && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {review.so_dien_thoai}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {renderStars(review.so_sao)}
                </div>
              </div>

              <div className="text-gray-700 text-sm mb-4">
                {review.noi_dung || "Khách hàng không để lại nội dung."}
              </div>

              {review.phan_hoi_chu_san ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-reply text-[#349DFF] text-xs"></i>
                    <span className="font-bold text-sm text-[#0a192f]">
                      Phản hồi của bạn
                    </span>
                    {review.ngay_phan_hoi && (
                      <span className="text-xs text-gray-400">
                        {formatDateTime(review.ngay_phan_hoi)}
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
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
            Chưa có đánh giá phù hợp
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-lg font-bold text-[#0a192f]">
                Phản hồi đánh giá
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                <div className="font-medium text-sm text-[#0a192f] mb-1">
                  {selectedReview ? getCustomerName(selectedReview) : "Khách hàng"}
                </div>
                <div className="flex gap-1 mb-2">
                  {renderStars(selectedReview?.so_sao)}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedReview?.noi_dung || "Không có nội dung."}
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
                  onClick={closeModal}
                  disabled={isSavingReply}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-70"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={isSavingReply}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md disabled:opacity-70"
                >
                  {isSavingReply ? "Đang lưu..." : "Lưu phản hồi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
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
                  Đánh giá của:{" "}
                  {reportReview ? getCustomerName(reportReview) : "Khách hàng"}
                </div>
                <div className="text-sm text-gray-600">
                  "{reportReview?.noi_dung || "Không có nội dung."}"
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Hệ thống sẽ gửi cảnh báo tới Admin để xử lý đánh giá này.
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
                  disabled={isReporting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-70"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isReporting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md disabled:opacity-70"
                >
                  {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
