import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAssetUrl } from "../../api/axios";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { showToast } from "../../components/common/ToastMessage";

// ─── Đổi thành URL backend của mày ──────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const GIOI_HAN = 10;
const PASSWORD_MESSAGE =
  "Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ và 1 số";

const getToken = () => localStorage.getItem("token");
const isValidPassword = (value) =>
  value.length >= 8 && /\p{L}/u.test(value) && /\d/.test(value);

const getVaiTroLabel = (id) =>
  id === 1 ? "Chủ sân" : id === 0 ? "Người chơi" : "Admin";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa có";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [vaiTro, setVaiTro] = useState("all");
  const [trangThai, setTrangThai] = useState("all");
  const [trang, setTrang] = useState(1);
  const [tongSo, setTongSo] = useState(0);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [lockingIds, setLockingIds] = useState(new Set());
  const [confirmUser, setConfirmUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [isCreateOwnerOpen, setIsCreateOwnerOpen] = useState(false);
  const [creatingOwner, setCreatingOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
  });

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
      });

      if (trangThai !== "all") {
        params.set("trang_thai", trangThai);
      }

      const queryString = params.toString();

      if (vaiTro === "all") {
        const res = await fetch(`${API_BASE}/admin/tai-khoan?${queryString}`, {
          headers,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message ?? "Lỗi tải dữ liệu");

        setUsers(data.danh_sach ?? []);
        setTongSo(data.tong ?? 0);
        setTongSoTrang(Math.max(1, Math.ceil((data.tong ?? 0) / GIOI_HAN)));
      } else {
        const endpoint =
          vaiTro === "owner"
            ? `${API_BASE}/admin/tai-khoan/chu-san`
            : `${API_BASE}/admin/tai-khoan/nguoi-choi`;

        const res = await fetch(`${endpoint}?${queryString}`, { headers });
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
  }, [tuKhoa, vaiTro, trangThai, trang]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Khóa / Mở khóa ──────────────────────────────────────────
  const handleViewDetail = async (user) => {
    setDetailLoadingId(user.id);

    try {
      const res = await fetch(`${API_BASE}/admin/tai-khoan/${user.id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Không thể tải chi tiết người dùng");
      }

      setSelectedUser(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDetailLoadingId(null);
    }
  };

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
      setConfirmUser(null);
    } catch (err) {
      showToast(err.message, "error");
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

  const handleTrangThaiChange = (e) => {
    setTrangThai(e.target.value);
    setTrang(1);
  };

  const handleOwnerFormChange = (e) => {
    const { name, value } = e.target;
    setOwnerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeCreateOwnerModal = () => {
    setIsCreateOwnerOpen(false);
    setOwnerForm({
      ho_ten: "",
      email: "",
      so_dien_thoai: "",
      mat_khau: "",
    });
  };

  const handleCreateOwner = async (e) => {
    e.preventDefault();

    if (!isValidPassword(ownerForm.mat_khau)) {
      setError(PASSWORD_MESSAGE);
      showToast(PASSWORD_MESSAGE, "error");
      return;
    }

    setCreatingOwner(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/tai-khoan/chu-san`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ownerForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Không thể tạo chủ sân");

      closeCreateOwnerModal();
      setVaiTro("owner");
      setTrang(1);
      await fetchUsers();
      showToast(data.message || "Tạo tài khoản chủ sân thành công", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setCreatingOwner(false);
    }
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

        <div className="flex items-center gap-3">          <button
            onClick={() => setIsCreateOwnerOpen(true)}
            className="bg-[#349DFF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            Thêm chủ sân
          </button>

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

          <select
            value={trangThai}
            onChange={handleTrangThaiChange}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#349DFF] transition-all bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="0">Đã khóa</option>
          </select>

          {/* Tìm kiếm */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <i className="fa-solid fa-magnifying-glass text-sm leading-none" />
            </span>
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
                <th className="px-6 py-4 whitespace-nowrap">STT</th>
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
                users.map((user, index) => {
                  const isActive = user.trang_thai === 1;
                  const isLocking = lockingIds.has(user.id);
                  const vaiTroLabel = getVaiTroLabel(user.vai_tro_id);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {(trang - 1) * GIOI_HAN + index + 1}
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
                          onClick={() => handleViewDetail(user)}
                          disabled={detailLoadingId === user.id}
                          className="mr-1 w-8 h-8 rounded-lg transition-colors border border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xem chi tiết"
                        >
                          {detailLoadingId === user.id ? (
                            <i className="fa-solid fa-spinner fa-spin text-xs" />
                          ) : (
                            <i className="fa-solid fa-eye text-xs" />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmUser(user)}
                          disabled={isLocking}
                          title={isActive ? "Khóa" : "Mở khóa"}
                          className={`w-8 h-8 rounded-lg transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                            isActive
                              ? "text-orange-600 hover:bg-orange-50 hover:border-orange-200"
                              : "text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                          }`}
                        >
                          {isLocking ? (
                            <i className="fa-solid fa-spinner fa-spin text-xs" />
                          ) : isActive ? (
                            <i className="fa-solid fa-lock text-xs"></i>
                          ) : (
                            <i className="fa-solid fa-lock-open text-xs"></i>
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

      {isCreateOwnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <div>
                <h3 className="text-lg font-bold text-[#0a192f]">
                  Thêm chủ sân
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tạo tài khoản chủ sân mới trên hệ thống
                </p>
              </div>
              <button
                onClick={closeCreateOwnerModal}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Họ tên *</label>
                <input
                  name="ho_ten"
                  value={ownerForm.ho_ten}
                  onChange={handleOwnerFormChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={ownerForm.email}
                  onChange={handleOwnerFormChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số điện thoại *</label>
                <input
                  name="so_dien_thoai"
                  value={ownerForm.so_dien_thoai}
                  onChange={handleOwnerFormChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mật khẩu *</label>
                <input
                  type="password"
                  name="mat_khau"
                  value={ownerForm.mat_khau}
                  onChange={handleOwnerFormChange}
                  minLength={8}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#349DFF]"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">{PASSWORD_MESSAGE}</p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeCreateOwnerModal}
                  disabled={creatingOwner}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-70"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingOwner}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#349DFF] hover:bg-blue-600 disabled:opacity-70"
                >
                  {creatingOwner ? "Đang tạo..." : "Tạo chủ sân"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[calc(100vh-32px)] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
              <div>
                <h3 className="text-lg font-bold text-[#0a192f]">
                  Chi tiết người dùng
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  #{selectedUser.id} - {selectedUser.ho_ten}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Đóng"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-5">
                <div className="w-24 h-24 rounded-2xl bg-[#eef3ff] flex items-center justify-center overflow-hidden text-3xl font-bold text-[#349DFF]">
                  {selectedUser.avatar ? (
                    <img
                      src={getAssetUrl(selectedUser.avatar)}
                      alt={selectedUser.ho_ten}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedUser.ho_ten?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <InfoLine label="Họ tên" value={selectedUser.ho_ten} />
                  <InfoLine label="Vai trò" value={getVaiTroLabel(selectedUser.vai_tro_id)} />
                  <InfoLine label="Email" value={selectedUser.email} />
                  <InfoLine label="Số điện thoại" value={selectedUser.so_dien_thoai} />
                  <InfoLine
                    label="Trạng thái"
                    value={Number(selectedUser.trang_thai) === 1 ? "Hoạt động" : "Bị khóa"}
                  />
                  <InfoLine label="Ngày tạo" value={formatDateTime(selectedUser.ngay_tao)} />
                </div>
              </div>

              {Number(selectedUser.vai_tro_id) === 1 && (
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-bold text-[#0a192f] mb-3">
                    Cơ sở của chủ sân
                  </h4>
                  {selectedUser.co_so?.length ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] text-gray-600">
                          <tr>
                            <th className="px-4 py-3 whitespace-nowrap">Cơ sở</th>
                            <th className="px-4 py-3 whitespace-nowrap">Địa chỉ</th>
                            <th className="px-4 py-3 whitespace-nowrap">Sân</th>
                            <th className="px-4 py-3 whitespace-nowrap">Trạng thái</th>
                            <th className="px-4 py-3 whitespace-nowrap">Duyệt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedUser.co_so.map((facility) => (
                            <tr key={facility.id}>
                              <td className="px-4 py-3 font-semibold text-[#0a192f]">
                                {facility.ten}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {[facility.dia_chi, facility.phuong_xa, facility.tinh_thanh]
                                  .filter(Boolean)
                                  .join(", ") || "Chưa cập nhật"}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {facility.so_san ?? 0}
                              </td>
                              <td className="px-4 py-3">
                                {Number(facility.trang_thai) === 1
                                  ? "Hoạt động"
                                  : Number(facility.trang_thai) === 2
                                    ? "Đã khóa"
                                    : "Đã xóa"}
                              </td>
                              <td className="px-4 py-3">
                                {Number(facility.trang_thai_duyet) === 1
                                  ? "Đã duyệt"
                                  : Number(facility.trang_thai_duyet) === 2
                                    ? "Từ chối"
                                    : "Chờ duyệt"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                      Chủ sân này chưa có cơ sở nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmUser)}
        title={
          confirmUser?.trang_thai === 1
            ? "Xác nhận khóa tài khoản"
            : "Xác nhận mở khóa tài khoản"
        }
        message={
          confirmUser?.trang_thai === 1
            ? `Bạn chắc chắn muốn khóa tài khoản "${confirmUser?.ho_ten}"? Người dùng này sẽ không thể đăng nhập.`
            : `Bạn chắc chắn muốn mở khóa tài khoản "${confirmUser?.ho_ten}"?`
        }
        confirmText={confirmUser?.trang_thai === 1 ? "Khóa" : "Mở khóa"}
        danger={confirmUser?.trang_thai === 1}
        loading={confirmUser ? lockingIds.has(confirmUser.id) : false}
        onCancel={() => setConfirmUser(null)}
        onConfirm={() => handleToggleLock(confirmUser)}
      />
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-[#0a192f] mt-1">
        {value || "Chưa có"}
      </div>
    </div>
  );
}
