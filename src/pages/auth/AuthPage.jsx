import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import { showToast } from "../../components/common/ToastMessage";

export default function AuthPage({ initialForm = "login" }) {
  const location = useLocation();
  const [activeForm, setActiveForm] = useState(initialForm);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(
        location.state.toastMessage,
        location.state.toastType || "success",
      );
    }
  }, [location.state]);

  const handleSetActiveForm = (form, toastOptions = null) => {
    setActiveForm(form);
    if (toastOptions?.toastMessage) {
      showToast(toastOptions.toastMessage, toastOptions.toastType || "success");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 p-4 font-sans text-[#0a192f] sm:p-6">
      <style>
        {`
          @keyframes fadeInSlideUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeInSlideUp 0.4s ease-out forwards;
          }
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out forwards;
          }
        `}
      </style>

      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[35rem] w-[35rem] rounded-full bg-blue-500/30 blur-[100px]"></div>
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/30 blur-[120px]"></div>
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[25rem] w-[25rem] rounded-full bg-cyan-400/20 blur-[90px]"></div>

      <div className="relative z-10 w-full max-w-[480px] rounded-3xl border border-white bg-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-[#0a192f]">
          <img src="/logo.png" alt="BadmintonBooking" className="h-12 w-auto object-contain" />
          <span>BadmintonBooking</span>
        </div>

        <div key={activeForm} className="animate-fade-in">
          {activeForm === "login" && (
            <LoginForm setActiveForm={handleSetActiveForm} />
          )}
          {activeForm === "register" && (
            <RegisterForm setActiveForm={handleSetActiveForm} />
          )}
          {activeForm === "forgot" && (
            <ForgotPasswordForm setActiveForm={handleSetActiveForm} />
          )}
        </div>
      </div>
    </div>
  );
}
