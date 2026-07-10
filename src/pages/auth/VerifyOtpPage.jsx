import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = location.state?.email || "";

  useEffect(() => {
    if (!userEmail) navigate("/login");
  }, [userEmail, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return undefined;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    const visibleLength = Math.min(2, name.length);
    return `${name.substring(0, visibleLength)}***@${domain}`;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (Number.isNaN(Number(value))) return;

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

    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i += 1) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    const nextIndex = pasteData.length < 6 ? pasteData.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/quen-mat-khau", { email: userEmail });
      setTimeLeft(300);
      showToast("Đã gửi lại mã OTP", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      showToast("Vui lòng nhập đủ 6 chữ số OTP", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/xac-thuc-otp", {
        email: userEmail,
        ma_otp: otpValue,
      });
      showToast("Xác minh OTP thành công", "success");
      navigate("/dat-lai-mat-khau", { state: { email: userEmail } });
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 p-4 font-sans text-[#0a192f] sm:p-6">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[35rem] w-[35rem] rounded-full bg-blue-500/30 blur-[100px]"></div>
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/30 blur-[120px]"></div>
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[25rem] w-[25rem] rounded-full bg-cyan-400/20 blur-[90px]"></div>

      <div className="animate-fade-in relative z-10 w-full max-w-[480px] rounded-3xl border border-white bg-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-2xl font-bold tracking-tight text-[#0a192f]">
          <img src="/logo.png" alt="BadmintonBooking" className="h-12 w-auto object-contain" />
          <span>BadmintonBooking</span>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="mb-3 text-2xl font-bold text-[#0a192f]">
              Xác minh OTP
            </h1>
            <div className="px-2 text-sm leading-relaxed text-gray-500">
              Mã xác minh gồm 6 chữ số đã được gửi đến hộp thư
              <br />
              <span className="font-bold text-gray-800">
                {maskEmail(userEmail)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
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
                  className="h-14 w-12 rounded-xl border border-gray-300 bg-white text-center text-xl font-bold text-gray-800 shadow-sm outline-none transition-all focus:border-[#349DFF] focus:ring-2 focus:ring-[#349DFF]"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#349DFF] py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-blue-300"
            >
              <i className="fa-regular fa-circle-check"></i>
              {loading ? "Đang xác minh..." : "Xác nhận mã"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Chưa nhận được mã?{" "}
            {timeLeft > 0 ? (
              <span className="font-medium text-gray-400">
                Gửi lại sau {formatTime(timeLeft)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-[#349DFF] hover:underline"
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
