// src/components/common/ToastMessage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ToastMessage() {
  const location = useLocation();
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const handleToast = (event) => {
      setToast({
        show: true,
        message: event.detail?.message || "",
        type: event.detail?.type || "success",
      });
      setTimeout(
        () => setToast({ show: false, message: "", type: "success" }),
        1800,
      );
    };

    window.addEventListener("showToast", handleToast);
    return () => window.removeEventListener("showToast", handleToast);
  }, []);

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToast({
        show: true,
        message: location.state.toastMessage,
        type: location.state.toastType || "success",
      });
      window.history.replaceState({}, document.title);
      setTimeout(
        () => setToast({ show: false, message: "", type: "success" }),
        1500,
      );
    }
  }, [location]);

  if (!toast.show) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex justify-end pointer-events-none">
      <div
        className={`flex items-center px-10 py-5 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-down border-2 pointer-events-auto ${
          toast.type === "success"
            ? "bg-[#10B981] text-white border-green-400"
            : "bg-[#EF4444] text-white border-red-400"
        }`}
      >
        <i
          className={`mr-4 text-2xl ${toast.type === "success" ? "fa-regular fa-circle-check" : "fa-solid fa-circle-exclamation"}`}
        ></i>
        <span className="font-bold text-base tracking-wide whitespace-nowrap">
          {toast.message}
        </span>
      </div>
    </div>
  );
}

export const showToast = (message, type = "success") => {
  window.dispatchEvent(
    new CustomEvent("showToast", {
      detail: { message, type },
    }),
  );
};
