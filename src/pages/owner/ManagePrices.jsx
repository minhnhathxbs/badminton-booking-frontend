import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { showToast } from "../../components/common/ToastMessage";

const EMPTY_PRICE_DATA = {
  trong_tuan_thap_diem: "",
  trong_tuan_cao_diem: "",
  cuoi_tuan_thap_diem: "",
  cuoi_tuan_cao_diem: "",
};

const PRICE_ROWS = [
  {
    id: "thap_diem",
    label: "Thấp điểm",
    time: "05:00 - 17:00",
    iconClass: "fa-regular fa-clock",
    cells: [
      { key: "trong_tuan_thap_diem", highlight: false },
      { key: "cuoi_tuan_thap_diem", highlight: false },
    ],
  },
  {
    id: "cao_diem",
    label: "Cao điểm",
    time: "17:00 - 23:00",
    iconClass: "fa-solid fa-bolt",
    cells: [
      { key: "trong_tuan_cao_diem", highlight: true },
      { key: "cuoi_tuan_cao_diem", highlight: true },
    ],
  },
];

const formatDisplayPrice = (price) => {
  if (price === "" || price === null || price === undefined) return "";
  return Number(price).toLocaleString("vi-VN");
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default function ManagePrices() {
  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [depositPercentage, setDepositPercentage] = useState("30");
  const [priceData, setPriceData] = useState(EMPTY_PRICE_DATA);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedFacilityData = useMemo(
    () => facilities.find((facility) => String(facility.id) === selectedFacility),
    [facilities, selectedFacility],
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsInitialLoading(true);

        const [facilityRes, categoryRes] = await Promise.all([
          api.get("/co-so/cua-toi?trang_thai=1"),
          api.get("/danh-muc-san?trang_thai=1"),
        ]);

        const approvedFacilities = (facilityRes.data || []).filter(
          (facility) => Number(facility.trang_thai_duyet) === 1,
        );

        setFacilities(approvedFacilities);
        setCategories(categoryRes.data || []);

        if (approvedFacilities.length > 0) {
          setSelectedFacility(String(approvedFacilities[0].id));
          setDepositPercentage(String(Number(approvedFacilities[0].phan_tram_coc ?? 30)));
        }

        if ((categoryRes.data || []).length > 0) {
          setSelectedCategory(String(categoryRes.data[0].id));
        }
      } catch (error) {
        showToast(
          getErrorMessage(error, "Không thể tải dữ liệu cấu hình giá"),
          "error",
        );
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedFacility || !selectedCategory) {
      setPriceData(EMPTY_PRICE_DATA);
      return;
    }

    const fetchPriceConfig = async () => {
      try {
        setIsPriceLoading(true);

        const res = await api.get("/bang-gia", {
          params: {
            co_so_id: selectedFacility,
            danh_muc_san_id: selectedCategory,
          },
        });

        setDepositPercentage(String(Number(res.data.co_so?.phan_tram_coc ?? 30)));
        setPriceData({
          ...EMPTY_PRICE_DATA,
          ...(res.data.bang_gia || {}),
        });
      } catch (error) {
        setPriceData(EMPTY_PRICE_DATA);
        showToast(
          getErrorMessage(error, "Không thể tải bảng giá của cơ sở"),
          "error",
        );
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchPriceConfig();
  }, [selectedFacility, selectedCategory]);

  const handleFacilityChange = (e) => {
    const facilityId = e.target.value;
    const facility = facilities.find((item) => String(item.id) === facilityId);

    setSelectedFacility(facilityId);
    setDepositPercentage(String(Number(facility?.phan_tram_coc ?? 30)));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");

    setPriceData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleDepositPercentageChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setDepositPercentage(numericValue);
  };

  const getValidDepositPercentage = () => {
    if (depositPercentage === "") {
      showToast("Vui lòng nhập tỷ lệ đặt cọc", "error");
      return null;
    }

    const numericValue = Number(depositPercentage);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      numericValue > 100
    ) {
      showToast("Tỷ lệ đặt cọc phải nằm trong khoảng 0 - 100", "error");
      return null;
    }

    return numericValue;
  };

  const validateBeforeSave = () => {
    if (!selectedFacility || !selectedCategory) {
      showToast("Vui lòng chọn cơ sở và loại sân", "error");
      return false;
    }

    if (getValidDepositPercentage() === null) {
      return false;
    }

    const missingPrice = Object.values(priceData).some(
      (value) => value === "" || value === null || value === undefined,
    );

    if (missingPrice) {
      showToast("Vui lòng nhập đủ 4 mức giá", "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    try {
      setIsSaving(true);
      const validDepositPercentage = getValidDepositPercentage();

      const payload = {
        co_so_id: selectedFacility,
        danh_muc_san_id: selectedCategory,
        phan_tram_coc: validDepositPercentage,
        bang_gia: priceData,
      };

      const res = await api.put("/bang-gia", payload);

      setFacilities((prev) =>
        prev.map((facility) =>
          String(facility.id) === selectedFacility
            ? { ...facility, phan_tram_coc: validDepositPercentage }
            : facility,
        ),
      );

      showToast(res.data.message || "Cập nhật cấu hình giá thành công");
    } catch (error) {
      showToast(
        getErrorMessage(error, "Không thể cập nhật cấu hình giá"),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderPriceInput = ({ key, highlight }) => (
    <div className="relative">
      <input
        type="text"
        name={key}
        value={formatDisplayPrice(priceData[key])}
        onChange={handlePriceChange}
        disabled={isPriceLoading}
        className={`w-full rounded-lg border px-3 py-2 pr-10 text-center text-sm font-bold text-[#0a192f] outline-none transition-all disabled:bg-gray-100 ${
          highlight
            ? "border-[#eab308] bg-yellow-50/40 focus:ring-1 focus:ring-[#eab308]"
            : "border-gray-300 bg-white focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF]"
        }`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
        đ/h
      </span>
    </div>
  );

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="text-sm font-medium text-gray-500">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Đang tải cấu hình giá...
        </div>
      </div>
    );
  }

  const hasConfigTarget = facilities.length > 0 && categories.length > 0;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0a192f]">
            Cấu hình giá & tiền cọc
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý giá thuê sân theo cơ sở, loại sân, loại ngày và loại giờ
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isPriceLoading || !hasConfigTarget}
          className="flex items-center gap-2 rounded-xl bg-[#349DFF] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <i className="fa-solid fa-floppy-disk"></i>
          )}
          {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </div>

      {!hasConfigTarget && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Cần có ít nhất một cơ sở đã được duyệt và một loại sân đang hoạt động
          để cấu hình giá.
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0a192f]">
              Chọn cơ sở
            </label>
            <select
              value={selectedFacility}
              onChange={handleFacilityChange}
              disabled={facilities.length === 0}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] disabled:bg-gray-100"
            >
              {facilities.length === 0 ? (
                <option value="">Chưa có cơ sở đã duyệt</option>
              ) : (
                facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.ten}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0a192f]">
              Chọn loại sân
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={categories.length === 0}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] disabled:bg-gray-100"
            >
              {categories.length === 0 ? (
                <option value="">Chưa có loại sân</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.ten}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#0a192f]">
          Chính sách tiền cọc
        </h3>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <label className="w-48 text-sm font-medium text-gray-700">
            Tỷ lệ đặt cọc:
          </label>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                inputMode="numeric"
                value={depositPercentage}
                onChange={handleDepositPercentageChange}
                disabled={!selectedFacility}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 pr-9 text-sm outline-none transition-all focus:border-[#349DFF] focus:ring-1 focus:ring-[#349DFF] disabled:bg-gray-100"
                placeholder="VD: 30"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-gray-500">
                %
              </span>
            </div>
            <span className="hidden text-xs text-gray-500 sm:inline-block">
              <i className="fa-solid fa-circle-info mr-1"></i>
              Áp dụng cho {selectedFacilityData?.ten || "cơ sở đã chọn"}.
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#0a192f]">Bảng giá thuê sân</h3>
          {isPriceLoading && (
            <span className="text-xs font-medium text-gray-500">
              <i className="fa-solid fa-spinner fa-spin mr-1"></i>
              Đang tải bảng giá
            </span>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-[#f8fafc] font-bold text-[#0a192f]">
              <tr>
                <th className="w-1/3 whitespace-nowrap border-r border-gray-200 px-6 py-4">
                  Loại giờ \ Loại ngày
                </th>
                <th className="w-1/3 whitespace-nowrap border-r border-gray-200 px-6 py-4 text-center">
                  Trong tuần
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    Thứ 2 - Thứ 6
                  </span>
                </th>
                <th className="w-1/3 whitespace-nowrap px-6 py-4 text-center">
                  Cuối tuần
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    Thứ 7, Chủ nhật
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PRICE_ROWS.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50">
                  <td className="border-r border-gray-100 px-6 py-4">
                    <div
                      className={`font-bold ${
                        row.id === "cao_diem" ? "text-[#eab308]" : "text-[#0a192f]"
                      }`}
                    >
                      {row.label}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      <i className={`${row.iconClass} mr-1`}></i>
                      {row.time}
                    </div>
                  </td>
                  {row.cells.map((cell, index) => (
                    <td
                      key={cell.key}
                      className={`px-4 py-4 ${
                        index === 0 ? "border-r border-gray-100" : ""
                      }`}
                    >
                      {renderPriceInput(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
