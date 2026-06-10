import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import api, { getAssetUrl } from "../../api/axios";

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

  // Lấy dữ liệu user
  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/me");

      setProfileData({
        ho_ten: res.data.ho_ten || "",
        email: res.data.email || "",
        so_dien_thoai: res.data.so_dien_thoai || "",
        ngay_sinh: res.data.ngay_sinh ? res.data.ngay_sinh.split("T")[0] : "",
        gioi_tinh: res.data.gioi_tinh || "male",
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
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // Chỉ preview avatar, chưa upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Gộp cập nhật thông tin + avatar vào 1 request
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("ho_ten", profileData.ho_ten);
      formData.append("so_dien_thoai", profileData.so_dien_thoai);
      formData.append("ngay_sinh", profileData.ngay_sinh);
      formData.append("gioi_tinh", profileData.gioi_tinh);
      if (avatarFile) {
        formData.append("avatar", avatarFile); // đúng tên field backend expect
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

      // Dispatch sau navigate để Header fetch lại sau khi DB đã lưu xong
      setTimeout(() => {
        window.dispatchEvent(new Event("userUpdated"));
      }, 300);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-[#f4f7fb] to-indigo-100">
      <Header />

      <main className="max-w-[900px] mx-auto mt-10 px-4 flex-1 w-full mb-12">
        <h1 className="text-2xl font-bold mb-6 text-[#0a192f]">
          Quản lý tài khoản
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100"></div>

          {/* Avatar */}
          <div className="px-6 md:px-10 relative flex justify-between items-end -mt-12 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-md overflow-hidden">
                <div className="w-full h-full bg-[#eef3ff] rounded-full flex items-center justify-center text-blue-500 font-bold text-2xl overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : profileData.anh_dai_dien ? (
                    <img
                      src={getAssetUrl(profileData.anh_dai_dien)}
                      alt="avatar"
                      className="w-full h-full object-cover"
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
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-blue-500 text-white w-8 h-8 rounded-full shadow-md hover:bg-blue-600 border-2 border-white"
              >
                <i className="fa-solid fa-camera text-xs"></i>
              </button>
            </div>

            <Link
              to="/doi-mat-khau"
              className="bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-key"></i>
              Đổi mật khẩu
            </Link>
          </div>

          {/* Form */}
          <div className="px-6 md:px-10 pb-10">
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Họ và tên</label>

                <input
                  name="ho_ten"
                  value={profileData.ho_ten}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>

                <input
                  value={profileData.email}
                  readOnly
                  className="w-full border rounded-xl px-4 py-2.5 bg-gray-50 text-gray-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số điện thoại</label>

                <input
                  name="so_dien_thoai"
                  value={profileData.so_dien_thoai}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ngày sinh</label>

                <input
                  type="date"
                  name="ngay_sinh"
                  value={profileData.ngay_sinh}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Giới tính</label>

                <select
                  name="gioi_tinh"
                  value={profileData.gioi_tinh}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
