import { Link } from "react-router-dom";

const getHomePath = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = Number(user?.role ?? user?.vai_tro_id);

    if (role === 2) return "/admin/tong-quan";
    if (role === 1) return "/chu-san/tong-quan";
  } catch {
    return "/trang-chu";
  }

  return "/trang-chu";
};

export default function NotFoundPage() {
  const homePath = getHomePath();

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-[#0a192f]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center text-center">
        <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-extrabold text-[#349DFF] shadow-sm">
          <i className="fa-solid fa-face-sad-tear text-lg"></i>
          Trang không tồn tại
        </div>

        <div className="text-[92px] font-black leading-none tracking-tight text-[#349DFF] sm:text-[128px]">
          404
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium leading-7 text-gray-600">
          Đường dẫn này không tồn tại hoặc đã được thay đổi. Bạn có thể quay về
          trang chính để tiếp tục sử dụng hệ thống.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to={homePath}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#349DFF] px-5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-600"
          >
            <i className="fa-solid fa-house"></i>
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
