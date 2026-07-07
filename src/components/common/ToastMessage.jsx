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
    <div className="fixed left-4 right-4 top-4 z-[9999] flex justify-center pointer-events-none sm:left-auto sm:justify-end">
      <div
        className={`flex w-full max-w-sm items-start px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-down border-2 pointer-events-auto sm:w-auto sm:max-w-md sm:items-center sm:px-10 sm:py-5 ${
          toast.type === "success"
            ? "bg-[#10B981] text-white border-green-400"
            : "bg-[#EF4444] text-white border-red-400"
        }`}
      >
        <i
          className={`mr-3 mt-0.5 shrink-0 text-xl sm:mr-4 sm:mt-0 sm:text-2xl ${toast.type === "success" ? "fa-regular fa-circle-check" : "fa-solid fa-circle-exclamation"}`}
        ></i>
        <span className="min-w-0 break-words text-sm font-bold tracking-wide sm:text-base">
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
