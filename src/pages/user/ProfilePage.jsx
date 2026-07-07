import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../../api/axios";
import UserHeader from "../../components/common/UserHeader";

const normalizeGender = (value) => {
  const map = {
    1: "male",
    2: "female",
    3: "other",
    male: "male",
    female: "female",
    other: "other",
  };

  return map[value] || "male";
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    ngay_sinh: "",
    gioi_tinh: "male",
    anh_dai_dien: null,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/user/me");

      setProfileData({
        ho_ten: res.data.ho_ten || "",
        email: res.data.email || "",
        so_dien_thoai: res.data.so_dien_thoai || "",
        ngay_sinh: res.data.ngay_sinh ? res.data.ngay_sinh.split("T")[0] : "",
        gioi_tinh: normalizeGender(res.data.gioi_tinh),
        anh_dai_dien: res.data.avatar || null,
      });
    } catch (err) {
      navigate("/ho-so", {
        state: {
          toastMessage: err.response?.data?.message || "Lỗi cập nhật!",
          toastType: "error",
        },
      });
    }
  }, [navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchProfile, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchProfile]);

  const handleChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("ho_ten", profileData.ho_ten);
      formData.append("so_dien_thoai", profileData.so_dien_thoai);
      formData.append("ngay_sinh", profileData.ngay_sinh);
      formData.append("gioi_tinh", profileData.gioi_tinh);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await api.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/ho-so", {
        state: {
          toastMessage: "Cập nhật thông tin thành công!",
          toastType: "success",
        },
      });

      window.setTimeout(() => {
        window.dispatchEvent(new Event("userUpdated"));
      }, 300);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] font-sans text-slate-800">
      <UserHeader />

      <main className="mx-auto mb-12 mt-8 w-full max-w-[900px] px-4">
        <h1 className="mb-6 text-2xl font-bold text-[#0a192f]">
          Quản lý tài khoản
        </h1>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100" />

          <div className="relative -mt-12 mb-8 flex items-end justify-between px-6 md:px-10">
            <div className="group relative">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-white p-1.5 shadow-md">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#eef3ff] text-2xl font-bold text-blue-500">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : profileData.anh_dai_dien ? (
                    <img
                      src={getAssetUrl(profileData.anh_dai_dien)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profileData.ho_ten.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 h-8 w-8 rounded-full border-2 border-white bg-blue-500 text-white shadow-md hover:bg-blue-600"
                aria-label="Chọn ảnh đại diện"
              >
                <i className="fa-solid fa-camera text-xs"></i>
              </button>
            </div>

            <Link
              to="/doi-mat-khau"
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <i className="fa-solid fa-key"></i>
              Đổi mật khẩu
            </Link>
          </div>

          <div className="px-6 pb-10 md:px-10">
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Họ và tên</label>
                <input
                  name="ho_ten"
                  value={profileData.ho_ten}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  value={profileData.email}
                  readOnly
                  className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-gray-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input
                  name="so_dien_thoai"
                  value={profileData.so_dien_thoai}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ngày sinh</label>
                <input
                  type="date"
                  name="ngay_sinh"
                  value={profileData.ngay_sinh}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Giới tính</label>
                <select
                  name="gioi_tinh"
                  value={profileData.gioi_tinh}
                  onChange={handleChange}
                  className="w-full rounded-xl border px-4 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="col-span-1 flex justify-end pt-6 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
