import { useState, useEffect } from "react";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function AuthPage({ initialForm = "login" }) {
  const [activeForm, setActiveForm] = useState(initialForm);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setActiveForm(initialForm);
  }, [initialForm]);

  const handleSetActiveForm = (form, toastOptions = null) => {
    setActiveForm(form);
    if (toastOptions) {
      setToast(toastOptions);
      setTimeout(() => setToast(null), 1500);
    }
  };

  return (
    <div className="relative text-[#0a192f] min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100">
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

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
          <div
            className={`animate-slide-down flex items-center px-6 py-4 rounded-2xl shadow-2xl border-2 pointer-events-auto ${
              toast.toastType === "success"
                ? "bg-[#10B981] text-white border-green-400"
                : "bg-[#EF4444] text-white border-red-400"
            }`}
          >
            <i
              className={`mr-3 text-xl ${toast.toastType === "success" ? "fa-regular fa-circle-check" : "fa-solid fa-circle-exclamation"}`}
            ></i>
            <span className="font-bold text-sm whitespace-nowrap">
              {toast.toastMessage}
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl w-full max-w-[480px] rounded-3xl shadow-2xl border border-white p-8 sm:p-10">
        <div className="flex justify-center items-center gap-3 mb-8 text-[#0a192f] font-bold text-2xl tracking-tight">
          <div className="flex items-center gap-1 mb-4 text-[#0a192f] font-bold text-2xl tracking-tight">
            <img src="/logo.png" className="w-36 object-contain" />
            <div>BadmintonBooking</div>
          </div>
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
