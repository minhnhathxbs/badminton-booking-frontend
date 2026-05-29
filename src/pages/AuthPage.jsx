import { useState, useEffect } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

export default function AuthPage({ initialForm = "login" }) {
  const [activeForm, setActiveForm] = useState(initialForm);

  useEffect(() => {
    setActiveForm(initialForm);
  }, [initialForm]);

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
        `}
      </style>

      {/* Mảng màu trang trí nền rực rỡ và đa chiều hơn */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl w-full max-w-[480px] rounded-3xl shadow-2xl border border-white p-8 sm:p-10">
        <div className="flex justify-center items-center gap-3 mb-8 text-[#0a192f] font-bold text-2xl tracking-tight">
          <div className="w-10 h-10 rounded-full bg-[#eef3ff] flex items-center justify-center text-[#349DFF] shadow-sm">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8.5 2.5a15.3 15.3 0 0 1 0 19"></path>
              <path d="M15.5 2.5a15.3 15.3 0 0 0 0 19"></path>
            </svg>
          </div>
          <div>BadmintonBooking</div>
        </div>

        {/* Bọc các component vào div có hiệu ứng và key */}
        <div key={activeForm} className="animate-fade-in">
          {activeForm === "login" && (
            <LoginForm setActiveForm={setActiveForm} />
          )}
          {activeForm === "register" && (
            <RegisterForm setActiveForm={setActiveForm} />
          )}
          {activeForm === "forgot" && (
            <ForgotPasswordForm setActiveForm={setActiveForm} />
          )}
        </div>
      </div>
    </div>
  );
}
