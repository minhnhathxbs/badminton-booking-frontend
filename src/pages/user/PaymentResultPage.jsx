import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = Object.fromEntries(searchParams.entries());

      if (!params.vnp_TxnRef || !params.vnp_SecureHash) {
        setStatus("error");
        setResult({ message: "Du lieu thanh toan khong hop le" });
        return;
      }

      try {
        const res = await api.get("/thanh-toan/vnpay/return", { params });
        setResult(res.data);
        setStatus(res.data?.thanh_cong ? "success" : "error");
      } catch (err) {
        setStatus("error");
        setResult({
          message:
            err.response?.data?.message || "Khong the xac minh thanh toan",
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  const isSuccess = status === "success";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === "loading" ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i>
            <h1 className="mt-5 text-xl font-extrabold text-slate-900">
              Dang xac minh thanh toan
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Vui long doi trong giay lat.
            </p>
          </>
        ) : (
          <>
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <i
                className={`text-3xl ${
                  isSuccess
                    ? "fa-regular fa-circle-check"
                    : "fa-regular fa-circle-xmark"
                }`}
              ></i>
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-slate-900">
              {isSuccess ? "Thanh toan thanh cong" : "Thanh toan that bai"}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {result?.message || "Giao dich da duoc xu ly."}
            </p>

            {result?.dat_san_id && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="text-slate-500">Ma don: </span>
                <span className="font-bold text-slate-900">
                  #{result.dat_san_id}
                </span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                to="/trang-chu"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Ve trang chu
              </Link>
              <Link
                to="/trang-chu"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Tiep tuc dat san
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
