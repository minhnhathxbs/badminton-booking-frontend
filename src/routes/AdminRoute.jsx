import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminRoute() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) {
    return (
      <Navigate
        to="/dang-nhap"
        replace
        state={{
          toastMessage: "Vui lòng đăng nhập",
          toastType: "error",
          from: location.pathname,
        }}
      />
    );
  }

  if (Number(user?.role) !== 2) {
    return (
      <Navigate
        to="/trang-chu"
        replace
        state={{
          toastMessage: "Bạn không có quyền truy cập trang admin",
          toastType: "error",
        }}
      />
    );
  }

  return <Outlet />;
}
