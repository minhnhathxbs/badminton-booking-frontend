import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = location.state?.email || "";

  useEffect(() => {
    if (!userEmail) navigate("/login");
  }, [userEmail, navigate]);

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    const visibleLength = Math.min(2, name.length);
    const maskedName = name.substring(0, visibleLength) + "***";
    return `${maskedName}@${domain}`;
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) newOtp[i] = pasteData[i];
      setOtp(newOtp);
      const nextIndex = pasteData.length < 6 ? pasteData.length : 5;
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/quen-mat-khau", { email: userEmail });
      setTimeLeft(300);
      setError("");
      alert("Đã gửi lại mã OTP");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;
    setError("");

    try {
      await api.post("/auth/xac-thuc-otp", {
        email: userEmail,
        ma_otp: otpValue,
      });
      navigate("/dat-lai-mat-khau", { state: { email: userEmail } });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="relative text-[#0a192f] min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100">
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[25rem] h-[25rem] bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl w-full max-w-[480px] rounded-3xl shadow-2xl border border-white p-8 sm:p-10 animate-fade-in">
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

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0a192f] mb-3">
              Xác minh OTP
            </h1>
            <div className="text-sm text-gray-500 leading-relaxed px-2">
              Mã xác minh gồm 6 chữ số đã được gửi đến hộp thư
              <br />
              <span className="font-bold text-gray-800">
                {maskEmail(userEmail)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 border border-gray-300 rounded-xl text-center text-xl font-bold text-gray-800 focus:border-[#349DFF] focus:ring-2 focus:ring-[#349DFF] outline-none transition-all bg-white shadow-sm"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-[#349DFF] text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <i className="fa-regular fa-circle-check"></i> Xác nhận mã
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            Chưa nhận được mã?{" "}
            {timeLeft > 0 ? (
              <span className="text-gray-400 font-medium">
                Gửi lại sau {formatTime(timeLeft)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#349DFF] font-medium hover:underline"
              >
                Gửi lại ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
