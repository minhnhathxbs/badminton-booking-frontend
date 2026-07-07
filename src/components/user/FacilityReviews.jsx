import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../../api/axios";
import { showToast } from "../common/ToastMessage";

const emptySummary = {
  tong_danh_gia: 0,
  diem_trung_binh: 0,
  danh_sach: [],
};

const formatTime = (value) => String(value || "").slice(0, 5);

const formatLocalDateKey = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return String(value).slice(0, 10);
};

const getLatestEndDate = (order) => {
  const ends = (order.chi_tiet || [])
    .map((item) => {
      const datePart = formatLocalDateKey(item.ngay);
      const endTime = formatTime(item.gio_ket_thuc);
      if (!datePart || !endTime) return null;

      const endDate = new Date(`${datePart}T${endTime}:00`);
      return Number.isNaN(endDate.getTime()) ? null : endDate;
    })
    .filter(Boolean);

  if (!ends.length) return null;
  return ends.reduce((latest, date) => (date > latest ? date : latest));
};

const canReviewOrderBasic = (order, facilityId) => {
  if (Number(order.co_so?.id) !== Number(facilityId)) return false;
  if (![1, 4].includes(Number(order.trang_thai))) return false;
  if (Number(order.da_thanh_toan || 0) <= 0) return false;

  const latestEnd = getLatestEndDate(order);
  return latestEnd ? latestEnd <= new Date() : false;
};

const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN");
};

function StarRow({ rating = 0, className = "" }) {
  const value = Number(rating || 0);
  return (
    <span className={`text-yellow-500 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`${star <= Math.round(value) ? "fa-solid" : "fa-regular"} fa-star`}
        ></i>
      ))}
    </span>
  );
}

export default function FacilityReviews({ facility }) {
  const navigate = useNavigate();
  const facilityId = facility?.id;
  const [summary, setSummary] = useState(emptySummary);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const average = Number(summary.diem_trung_binh || 0);
  const reviews = useMemo(() => summary.danh_sach || [], [summary.danh_sach]);

  useEffect(() => {
    if (!facilityId) return;

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);

      api
        .get(`/danh-gia/co-so/${facilityId}`)
        .then((res) => {
          if (isMounted) {
            setSummary(res.data?.data || emptySummary);
          }
        })
        .catch(() => {
          if (isMounted) {
            setSummary(emptySummary);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [facilityId, refreshKey]);

  const openReviewModal = async () => {
    setIsChecking(true);
    try {
      const historyRes = await api.get("/dat-san/lich-su-cua-toi");
      const candidates = (historyRes.data || [])
        .filter((order) => canReviewOrderBasic(order, facilityId))
        .sort((a, b) => (getLatestEndDate(b) || 0) - (getLatestEndDate(a) || 0));

      let lastReason = "";
      for (const order of candidates) {
        const checkRes = await api.get(`/danh-gia/kiem-tra/${order.id}`);
        const data = checkRes.data?.data;

        if (data?.co_the_danh_gia) {
          setReviewOrder(order);
          setRating(5);
          setContent("");
          return;
        }

        lastReason = data?.ly_do || lastReason;
      }

      showToast(
        lastReason ||
          "Bạn cần có đơn đặt sân đã sử dụng tại cơ sở này mới được đánh giá",
        "error",
      );
    } catch (err) {
      if (err.response?.status === 401) {
        showToast("Vui lòng đăng nhập để viết đánh giá", "error");
        navigate("/dang-nhap");
        return;
      }

      showToast(err.response?.data?.message || "Không thể kiểm tra đánh giá", "error");
    } finally {
      setIsChecking(false);
    }
  };

  const submitReview = async () => {
    if (!rating) {
      showToast("Vui lòng chọn số sao", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/danh-gia", {
        dat_san_id: reviewOrder.id,
        so_sao: rating,
        noi_dung: content.trim(),
      });

      showToast(res.data?.message || "Đánh giá thành công", "success");
      setReviewOrder(null);
      setContent("");
      setRating(5);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể gửi đánh giá", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-gray-900">
          Đánh giá
        </h3>
        <button
          type="button"
          onClick={openReviewModal}
          disabled={isChecking}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? (
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          ) : (
            <i className="fa-solid fa-star"></i>
          )}
          Viết đánh giá
        </button>
      </div>

      <div className="mb-4 rounded-2xl bg-gray-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-3xl font-black text-gray-900">
            {average.toFixed(1)}
          </span>
          <div>
            <StarRow rating={average} className="text-sm" />
            <p className="text-xs font-medium text-gray-500">
              {Number(summary.tong_danh_gia || 0)} đánh giá từ khách đã đặt sân
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center text-sm font-semibold text-gray-500">
          <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
          Đang tải đánh giá
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.slice(0, 5).map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {review.avatar ? (
                    <img
                      src={getAssetUrl(review.avatar)}
                      alt={review.ten_nguoi_dung}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700">
                      {(review.ten_nguoi_dung || "K").charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900">
                      {review.ten_nguoi_dung || "Khách hàng"}
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      {formatDateTime(review.ngay_tao)}
                    </div>
                  </div>
                </div>
                <div className="whitespace-nowrap text-xs text-yellow-500">
                  <i className="fa-solid fa-star"></i>{" "}
                  {Number(review.so_sao || 0).toFixed(1)}
                </div>
              </div>
              <p className="text-sm leading-6 text-gray-600">
                {review.noi_dung || "Khách hàng không để lại nội dung."}
              </p>
              {review.phan_hoi_chu_san && (
                <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-800">
                  <span className="font-bold">Phản hồi chủ sân: </span>
                  {review.phan_hoi_chu_san}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center text-sm font-semibold text-gray-500">
          Chưa có đánh giá cho cơ sở này
        </div>
      )}

      {reviewOrder && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Đánh giá cơ sở
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {facility?.ten} - Đơn #{reviewOrder.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                disabled={isSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-60"
                aria-label="Đóng"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    disabled={isSubmitting}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      value <= rating
                        ? "border-amber-300 bg-amber-50 text-amber-500"
                        : "border-slate-200 text-slate-300 hover:bg-slate-50"
                    }`}
                    aria-label={`${value} sao`}
                  >
                    <i className="fa-solid fa-star"></i>
                  </button>
                ))}
              </div>

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Nhập nhận xét của bạn..."
                disabled={isSubmitting}
                className="h-32 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-amber-400 disabled:bg-slate-50"
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      Đang gửi
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-star"></i>
                      Gửi đánh giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
