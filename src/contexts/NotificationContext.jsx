import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api, { ASSET_BASE_URL } from "../api/axios";
import { NotificationContext } from "./notificationStore";

const docUserHienTai = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function NotificationProvider({ children }) {
  const [danhSach, setDanhSach] = useState([]);
  const [soChuaDoc, setSoChuaDoc] = useState(0);
  const [dangTai, setDangTai] = useState(false);
  const [userId, setUserId] = useState(() => docUserHienTai()?.id ?? null);
  const socketRef = useRef(null);

  // Theo dõi user đăng nhập / đăng xuất
  useEffect(() => {
    const capNhatUser = () => {
      const user = docUserHienTai();
      const token = localStorage.getItem("token");
      setUserId(token && user ? (user.id ?? null) : null);
    };

    capNhatUser();
    window.addEventListener("userUpdated", capNhatUser);
    window.addEventListener("storage", capNhatUser);
    return () => {
      window.removeEventListener("userUpdated", capNhatUser);
      window.removeEventListener("storage", capNhatUser);
    };
  }, []);

  const taiThongBao = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    setDangTai(true);
    try {
      const res = await api.get("/thong-bao", { params: { gioi_han: 20 } });
      setDanhSach(res.data.danh_sach || []);
      setSoChuaDoc(res.data.so_chua_doc || 0);
    } catch {
      // im lặng, không chặn UI
    } finally {
      setDangTai(false);
    }
  }, []);

  // Kết nối socket + tải dữ liệu khi có user
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDanhSach([]);
      setSoChuaDoc(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    taiThongBao();

    const socket = io(ASSET_BASE_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const join = () => socket.emit("notification:join", { nguoi_dung_id: userId });
    socket.on("connect", join);
    join();

    socket.on("notification:new", (tb) => {
      setDanhSach((truoc) => [tb, ...truoc].slice(0, 50));
      setSoChuaDoc((truoc) =>
        typeof tb.so_chua_doc === "number" ? tb.so_chua_doc : truoc + 1,
      );
      toast(tb.tieu_de, { icon: "🔔" });
    });

    return () => {
      socket.emit("notification:leave", { nguoi_dung_id: userId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, taiThongBao]);

  const danhDauDaDoc = useCallback(async (id) => {
    setDanhSach((truoc) =>
      truoc.map((tb) => (tb.id === id ? { ...tb, da_doc: 1 } : tb)),
    );
    setSoChuaDoc((truoc) => Math.max(0, truoc - 1));
    try {
      const res = await api.patch(`/thong-bao/${id}/da-doc`);
      if (typeof res.data?.so_chua_doc === "number") {
        setSoChuaDoc(res.data.so_chua_doc);
      }
    } catch {
      // bỏ qua
    }
  }, []);

  const danhDauTatCa = useCallback(async () => {
    setDanhSach((truoc) => truoc.map((tb) => ({ ...tb, da_doc: 1 })));
    setSoChuaDoc(0);
    try {
      await api.patch("/thong-bao/doc-tat-ca");
    } catch {
      // bỏ qua
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        danhSach,
        soChuaDoc,
        dangTai,
        taiThongBao,
        danhDauDaDoc,
        danhDauTatCa,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
