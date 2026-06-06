import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Đổi thành URL backend của mày ──────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const GIOI_HAN = 10;

const getToken = () => localStorage.getItem("token");

const getVaiTroLabel = (id) =>
  id === 1 ? "Chủ sân" : id === 0 ? "Người chơi" : "Admin";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [vaiTro, setVaiTro] = useState("all");
  const [trang, setTrang] = useState(1);
  const [tongSo, setTongSo] = useState(0);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [lockingIds, setLockingIds] = useState(new Set());

  const searchTimer = useRef(null);

  // ── Debounce tìm kiếm ────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setTuKhoa(searchInput);
      setTrang(1);
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  // ── Fetch dữ liệu ────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };

      const params = new URLSearchParams({
        tu_khoa: tuKhoa,
        trang,
        gioi_han: GIOI_HAN,
      }).toString();

      if (vaiTro === "all") {
        // Gọi cả 2 endpoint song song
        const [resChu, resNguoi] = await Promise.all([
          fetch(`${API_BASE}/admin/tai-khoan/chu-san?${params}`, { headers }),
          fetch(`${API_BASE}/admin/tai-khoan/nguoi-choi?${params}`, {
            headers,
          }),
        ]);

        if (!resChu.ok || !resNguoi.ok) {
          throw new Error("Không thể tải danh sách người dùng");
        }

        const [dataChu, dataNguoi] = await Promise.all([
          resChu.json(),
          resNguoi.json(),
        ]);

        const combined = [
          ...(dataChu.danh_sach ?? []),
          ...(dataNguoi.danh_sach ?? []),
        ].sort((a, b) => new Date(b.ngay_tao) - new Date(a.ngay_tao));

        const tong = (dataChu.tong ?? 0) + (dataNguoi.tong ?? 0);
        setUsers(combined);
        setTongSo(tong);
        setTongSoTrang(Math.max(1, Math.ceil(tong / GIOI_HAN)));
      } else {
        const endpoint =
          vaiTro === "owner"
            ? `${API_BASE}/admin/tai-khoan/chu-san`
            : `${API_BASE}/admin/tai-khoan/nguoi-choi`;

        const res = await fetch(`${endpoint}?${params}`, { headers });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message ?? "Lỗi tải dữ liệu");

        setUsers(data.danh_sach ?? []);
        setTongSo(data.tong ?? 0);
        setTongSoTrang(Math.max(1, Math.ceil((data.tong ?? 0) / GIOI_HAN)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tuKhoa, vaiTro, trang]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Khóa / Mở khóa ──────────────────────────────────────────
  const handleToggleLock = async (user) => {
    const isActive = user.trang_thai === 1;
    const endpoint = isActive
      ? `${API_BASE}/admin/tai-khoan/${user.id}/khoa`
      : `${API_BASE}/admin/tai-khoan/${user.id}/mo-khoa`;

    setLockingIds((prev) => new Set(prev).add(user.id));

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Thao tác thất bại");

      // Cập nhật state cục bộ — không cần gọi lại API
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, trang_thai: isActive ? 0 : 1 } : u,
        ),
      );
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLockingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  // ── Handlers ────────────────────────────────────────────────
  const handleVaiTroChange = (e) => {
    setVaiTro(e.target.value);
    setTrang(1);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Quản lý người dùng
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tài khoản người chơi và chủ sân trên hệ thống
            {!loading && (
              <span className="ml-2 font-medium text-[#349DFF]">
                ({tongSo} người dùng)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Lọc vai trò */}
          <select
            value={vaiTro}
            onChange={handleVaiTroChange}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="player">Người chơi</option>
            <option value="owner">Chủ sân</option>
          </select>

          {/* Tìm kiếm */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm email, tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Bảng ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Thông báo lỗi */}
        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation" />
            {error}
            <button
              onClick={fetchUsers}
              className="ml-auto text-red-500 underline text-xs"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Người dùng</th>
                <th className="px-6 py-4 whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Loading skeleton */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-10" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-32 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-100 rounded-lg w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-100 rounded-lg w-24" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-7 bg-gray-100 rounded-lg w-16 ml-auto" />
                    </td>
                  </tr>
                ))}

              {/* Không có dữ liệu */}
              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    <i className="fa-solid fa-users-slash text-3xl mb-3 block opacity-30" />
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}

              {/* Dữ liệu thật */}
              {!loading &&
                users.map((user) => {
                  const isActive = user.trang_thai === 1;
                  const isLocking = lockingIds.has(user.id);
                  const vaiTroLabel = getVaiTroLabel(user.vai_tro_id);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-gray-500">
                        #{user.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0a192f]">
                          {user.ho_ten}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${
                            user.vai_tro_id === 1
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {vaiTroLabel}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${
                            isActive
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {isActive ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleLock(user)}
                          disabled={isLocking}
                          className={`px-3 py-1.5 rounded-lg transition-colors border border-transparent text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                            isActive
                              ? "text-red-500 hover:bg-red-50 hover:border-red-200"
                              : "text-green-600 hover:bg-green-50 hover:border-green-200"
                          }`}
                        >
                          {isLocking ? (
                            <span className="flex items-center gap-1">
                              <i className="fa-solid fa-spinner fa-spin text-xs" />
                              {isActive ? "Đang khóa..." : "Đang mở..."}
                            </span>
                          ) : isActive ? (
                            "Khóa"
                          ) : (
                            "Mở khóa"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* ── Phân trang ───────────────────────────────────── */}
        {!loading && tongSoTrang > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Trang {trang}/{tongSoTrang} · {tongSo} người dùng
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrang((p) => Math.max(1, p - 1))}
                disabled={trang === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Trước
              </button>

              {/* Render page numbers */}
              {Array.from({ length: tongSoTrang }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === tongSoTrang || Math.abs(p - trang) <= 1,
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setTrang(item)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        trang === item
                          ? "bg-[#349DFF] text-white"
                          : "border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF]"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                onClick={() => setTrang((p) => Math.min(tongSoTrang, p + 1))}
                disabled={trang === tongSoTrang}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#349DFF] hover:text-[#349DFF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
