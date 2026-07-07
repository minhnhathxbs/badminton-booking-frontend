import { useEffect, useMemo, useState } from "react";
import api, { getAssetUrl } from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const TXT = {
  title: "Đánh giá bị báo cáo",
  desc: "Xem xét và xử lý các đánh giá bị chủ sân báo cáo vi phạm.",
  loading: "Đang tải...",
  empty: "Chưa có đánh giá bị báo cáo",
  loadFail: "Không thể tải danh sách",
  customer: "Khách hàng",
  facility: "Cơ sở",
  owner: "Chủ sân",
  booking: "Đơn",
  rating: "Số sao",
  content: "Nội dung đánh giá",
  status: "Trạng thái",
  createdAt: "Ngày đánh giá",
  action: "Thao tác",
  accept: "Duyệt báo cáo",
  reject: "Từ chối báo cáo",
  acceptDesc: "Ẩn đánh giá vĩnh viễn",
  rejectDesc: "Khôi phục đánh giá hiển thị công khai",
  processing: "Đang xử lý",
  processFail: "Không thể xử lý",
  total: "Tổng báo cáo",
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const renderStars = (rating) =>
  Array.from({ length: 5 }).map((_, index) => (
    <i
      key={index}
      className={`fa-solid fa-star text-[13px] ${
        index < Number(rating || 0) ? "text-yellow-400" : "text-gray-300"
      }`}
    ></i>
  ));

export default function ManageReportedReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [decision, setDecision] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/danh-gia/admin/bao-cao");
      setReviews(res.data?.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || TXT.loadFail, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, []);

  const stats = useMemo(() => {
    return { total: reviews.length };
  }, [reviews]);

  const submitDecision = async () => {
    if (!decision) return;

    const { review, action } = decision;
    setProcessingId(review.id);
    try {
      const res = await api.patch(`/danh-gia/admin/bao-cao/${review.id}/xu-ly`, {
        hanh_dong: action,
      });

      showToast(res.data?.message || "Xử lý thành công");
      setDecision(null);
      await fetchReviews();
    } catch (error) {
      showToast(error.response?.data?.message || TXT.processFail, "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">{TXT.title}</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">{TXT.desc}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="fa-flag" label={TXT.total} value={stats.total} color="red" />
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-sm font-medium text-gray-500">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i>
            {TXT.loading}
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <i className="fa-regular fa-flag text-5xl text-gray-300"></i>
          <h3 className="mt-4 text-lg font-bold text-gray-800">{TXT.empty}</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <Th>#</Th>
                  <Th>{TXT.customer}</Th>
                  <Th>{TXT.facility}</Th>
                  <Th>{TXT.owner}</Th>
                  <Th>{TXT.rating}</Th>
                  <Th>{TXT.content}</Th>
                  <Th>{TXT.createdAt}</Th>
                  <Th>{TXT.action}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review, index) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <Td>{index + 1}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {review.avatar_khach ? (
                          <img
                            src={getAssetUrl(review.avatar_khach)}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                            {(review.ten_khach || "K").charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {review.ten_khach || "Khách hàng"}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <div className="font-medium text-gray-900">
                        {review.ten_co_so || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {TXT.booking} #{review.dat_san_id}
                      </div>
                    </Td>
                    <Td>{review.ten_chu_san || "-"}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        {renderStars(review.so_sao)}
                        <span className="ml-1 text-xs font-medium text-gray-600">
                          {review.so_sao}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <p className="max-w-xs truncate text-gray-700">
                        {review.noi_dung || "-"}
                      </p>
                    </Td>
                    <Td className="whitespace-nowrap text-gray-500">
                      {formatDateTime(review.ngay_tao)}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDecision({ review, action: "duyet" })}
                          disabled={processingId === review.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          {processingId === review.id ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                          ) : (
                            TXT.accept
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecision({ review, action: "tu_choi" })}
                          disabled={processingId === review.id}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          {TXT.reject}
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {decision && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#0a192f]">
              {decision.action === "duyet" ? TXT.accept : TXT.reject}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {decision.action === "duyet" ? TXT.acceptDesc : TXT.rejectDesc}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDecision(null)}
                disabled={processingId === decision.review.id}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitDecision}
                disabled={processingId === decision.review.id}
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60 ${
                  decision.action === "duyet"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {processingId === decision.review.id ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClass = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
  }[color];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${colorClass}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="text-xl font-bold text-[#0a192f]">{value}</div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 font-semibold text-gray-500">{children}</th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 align-top ${className}`}>{children}</td>
  );
}
