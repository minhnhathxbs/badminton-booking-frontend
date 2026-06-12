import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../../api/axios";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import { showToast } from "../../components/common/ToastMessage";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!localStorage.getItem("token")) {
        showToast("Vui lòng đăng nhập để xem danh sách yêu thích", "error");
        navigate("/dang-nhap");
        return;
      }

      try {
        const res = await api.get("/yeu-thich");
        setFavorites(res.data?.data || []);
      } catch (error) {
        showToast(error.response?.data?.message || "Không thể tải danh sách yêu thích", "error");
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const removeFavorite = async (facilityId) => {
    const normalizedId = Number(facilityId);
    if (removingIds.has(normalizedId)) return;

    setRemovingIds((prev) => new Set(prev).add(normalizedId));
    try {
      await api.delete(`/yeu-thich/${normalizedId}`);
      setFavorites((prev) => prev.filter((item) => Number(item.co_so_id) !== normalizedId));
      showToast("Đã bỏ yêu thích cơ sở");
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể bỏ yêu thích", "error");
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 text-gray-800">
      <Header />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Cơ sở yêu thích</h1>
            <p className="mt-1 text-sm text-gray-500">
              Danh sách cơ sở bạn đã lưu để đặt sân nhanh hơn.
            </p>
          </div>
          <Link
            to="/trang-chu"
            className="inline-flex w-max items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Về trang chủ
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
            Đang tải danh sách yêu thích...
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <i className="fa-regular fa-heart text-2xl"></i>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Chưa có cơ sở yêu thích</h2>
            <p className="mt-2 text-sm text-gray-500">
              Bấm biểu tượng trái tim ở trang chủ để lưu cơ sở bạn quan tâm.
            </p>
            <Link
              to="/trang-chu"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Tìm cơ sở
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {favorites.map((facility) => (
              <article
                key={facility.yeu_thich_id || facility.co_so_id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:p-4"
              >
                <Link
                  to={`/dat-san/${facility.co_so_id}`}
                  className="relative h-44 overflow-hidden rounded-xl bg-gray-100 sm:h-36 sm:w-56 sm:flex-shrink-0"
                >
                  {facility.anh_chinh ? (
                    <img
                      src={getAssetUrl(facility.anh_chinh)}
                      alt={facility.ten}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <i className="fa-regular fa-image text-3xl"></i>
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <Link
                      to={`/dat-san/${facility.co_so_id}`}
                      className="text-lg font-extrabold text-slate-900 hover:text-blue-600"
                    >
                      {facility.ten}
                    </Link>
                    <p className="mt-2 flex gap-2 text-sm text-gray-600">
                      <i className="fa-solid fa-location-dot mt-0.5 w-4 text-blue-600"></i>
                      <span>
                        {[facility.dia_chi, facility.phuong_xa, facility.tinh_thanh]
                          .filter(Boolean)
                          .join(", ") || "Chưa cập nhật địa chỉ"}
                      </span>
                    </p>
                    {facility.mo_ta && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {facility.mo_ta}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      Đã lưu yêu thích
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => removeFavorite(facility.co_so_id)}
                        disabled={removingIds.has(Number(facility.co_so_id))}
                        className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Bỏ yêu thích
                      </button>
                      <Link
                        to={`/dat-san/${facility.co_so_id}`}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Đặt sân
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
