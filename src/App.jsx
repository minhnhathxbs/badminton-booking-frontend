import { Navigate, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ToastMessage from "./components/common/ToastMessage";

function App() {
  return (
    // Dùng thẻ Fragment <> </> để bao bọc tất cả
    <>
      <ToastMessage />
      <Routes>
        <Route path="/" element={<Navigate to="/trang-chu" replace />} />
        <Route path="/trang-chu" element={<HomePage />} />

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
      </Routes>
    </>
  );
}

export default App;
