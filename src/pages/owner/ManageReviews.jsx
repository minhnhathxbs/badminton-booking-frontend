import React, { useState } from "react";

export default function ManageReviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      khach_hang: "Nguyễn Văn A",
      co_so: "Sân Cầu Lông Alpha",
      san: "Sân 1",
      so_sao: 5,
      noi_dung: "Sân mới, thảm êm, ánh sáng tốt. Sẽ quay lại ủng hộ.",
      ngay_tao: "01/06/2026 14:30",
      phan_hoi:
        "Cảm ơn bạn đã trải nghiệm dịch vụ tại sân Alpha. Rất mong được đón tiếp bạn trong lần tới!",
    },
    {
      id: 2,
      khach_hang: "Trần Thị B",
      co_so: "Sân Cầu Lông Beta",
      san: "Sân 3",
      so_sao: 3,
      noi_dung: "Sân hơi trơn, lưới bị chùng ở một bên.",
      ngay_tao: "31/05/2026 20:15",
      phan_hoi: null,
    },
    {
      id: 3,
      khach_hang: "Lê Minh C",
      co_so: "Sân Cầu Lông Alpha",
      san: "Sân VIP",
      so_sao: 5,
      noi_dung: "Rất hài lòng, nhân viên nhiệt tình.",
      ngay_tao: "30/05/2026 09:00",
      phan_hoi: null,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyContent(review.phan_hoi || "");
    setIsModalOpen(true);
  };

  const handleSubmitReply = () => {
    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id ? { ...r, phan_hoi: replyContent } : r,
      ),
    );
    setIsModalOpen(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star text-[13px] ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
      ></i>
    ));
  };

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
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white">
            <option value="all">Tất cả cơ sở</option>
            <option value="alpha">Sân Cầu Lông Alpha</option>
            <option value="beta">Sân Cầu Lông Beta</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white">
            <option value="all">Mọi trạng thái</option>
            <option value="unreplied">Chưa phản hồi</option>
            <option value="replied">Đã phản hồi</option>
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
              4.3{" "}
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
            <div className="text-2xl font-bold text-[#0a192f]">128</div>
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
            <div className="text-2xl font-bold text-red-500">12</div>
          </div>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                  {review.khach_hang.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#0a192f]">
                    {review.khach_hang}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {review.ngay_tao} • {review.co_so} ({review.san})
                  </div>
                </div>
              </div>
              <div className="flex gap-1">{renderStars(review.so_sao)}</div>
            </div>

            <div className="text-gray-700 text-sm mb-4">{review.noi_dung}</div>

            {review.phan_hoi ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-reply text-[#349DFF] text-xs"></i>
                  <span className="font-bold text-sm text-[#0a192f]">
                    Phản hồi của bạn
                  </span>
                </div>
                <div className="text-sm text-gray-600">{review.phan_hoi}</div>
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                onClick={() => handleOpenReplyModal(review)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  review.phan_hoi
                    ? "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    : "bg-[#349DFF] text-white border-transparent hover:bg-blue-600 shadow-sm"
                }`}
              >
                {review.phan_hoi ? "Sửa phản hồi" : "Phản hồi"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Phản hồi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
                  {selectedReview?.khach_hang}
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
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 transition-colors shadow-md"
                >
                  Lưu phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
