import { Navigate, Routes, Route, useParams } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import HomePage from "../pages/user/HomePage";
import BookingPage from "../pages/user/BookingPage";
import BookingHistoryPage from "../pages/user/BookingHistoryPage";
import FavoritesPage from "../pages/user/FavoritesPage";
import PaymentResultPage from "../pages/user/PaymentResultPage";
import ProfilePage from "../pages/user/ProfilePage";
import ChangePasswordPage from "../pages/user/ChangePasswordPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import MapPage from "../pages/user/MapPage";

import OwnerLayout from "../layouts/OwnerLayout";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import ManageFacilities from "../pages/owner/ManageFacilities";
import ManageBookings from "../pages/owner/ManageBookings";
import RevenueReport from "../pages/owner/RevenueReport";
import ManagePrices from "../pages/owner/ManagePrices";
import ManageCourts from "../pages/owner/ManageCourts";
import ManageCourtCategories from "../pages/owner/ManageCourtCategories";
import ManagePromotions from "../pages/owner/ManagePromotions";
import ManageReviews from "../pages/owner/ManageReviews";
import ManageRefunds from "../pages/owner/ManageRefunds";

import AdminLayout from "../layouts/AdminLayout";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageAllFacilities from "../pages/admin/ManageAllFacilities";
import ManageAllPromotions from "../pages/admin/ManageAllPromotions";
import OwnerRoute from "./OwnerRoute";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SystemConfig from "../pages/admin/SystemConfig";
import SystemLogs from "../pages/admin/SystemLogs";

function RedirectFacilityToBooking() {
  const { id } = useParams();
  return <Navigate to={`/dat-san/${id}`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trang-chu" element={<HomePage />} />
      <Route path="/ban-do" element={<MapPage />} />
      <Route path="/dat-san/:id" element={<BookingPage />} />
      <Route path="/lich-su-dat-san" element={<BookingHistoryPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/yeu-thich" element={<FavoritesPage />} />
      <Route path="/thanh-toan/ket-qua" element={<PaymentResultPage />} />
      <Route path="/co-so/:id" element={<RedirectFacilityToBooking />} />
      <Route path="/login" element={<AuthPage initialForm="login" />} />
      <Route path="/dang-nhap" element={<AuthPage initialForm="login" />} />
      <Route path="/register" element={<AuthPage initialForm="register" />} />
      <Route path="/dang-ky" element={<AuthPage initialForm="register" />} />
      <Route path="/doi-mat-khau" element={<ChangePasswordPage />} />
      <Route
        path="/forgot-password"
        element={<AuthPage initialForm="forgot" />}
      />
      <Route
        path="/quen-mat-khau"
        element={<AuthPage initialForm="forgot" />}
      />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/ho-so" element={<ProfilePage />} />
      <Route path="/xac-minh-otp" element={<VerifyOtpPage />} />
      <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
      <Route element={<OwnerRoute />}>
        <Route path="/chu-san" element={<OwnerLayout />}>
          <Route index element={<Navigate to="tong-quan" replace />} />
          <Route path="tong-quan" element={<OwnerDashboard />} />
          <Route path="co-so" element={<ManageFacilities />} />
          <Route path="san" element={<ManageCourts />} />
          <Route path="lich-dat" element={<ManageBookings />} />
          <Route path="khuyen-mai" element={<ManagePromotions />} />
          <Route path="doanh-thu" element={<RevenueReport />} />
          <Route path="bang-gia" element={<ManagePrices />} />
          <Route path="hoan-tien" element={<ManageRefunds />} />
          <Route path="danh-gia" element={<ManageReviews />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="tong-quan" replace />} />
          <Route path="tong-quan" element={<AdminDashboard />} />
          <Route path="nguoi-dung" element={<ManageUsers />} />
          <Route path="co-so" element={<ManageAllFacilities />} />
          <Route path="khuyen-mai" element={<ManageAllPromotions />} />
          <Route path="danh-muc-san" element={<ManageCourtCategories />} />
          <Route path="duyet-co-so" element={<ManageAllFacilities />} />
          <Route path="cau-hinh" element={<SystemConfig />} />
          <Route path="nhat-ky" element={<SystemLogs />} />
        </Route>
      </Route>
    </Routes>
  );
}
