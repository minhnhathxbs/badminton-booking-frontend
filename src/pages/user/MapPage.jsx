import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

import api, { getAssetUrl } from "../../api/axios";
import UserHeader from "../../components/common/UserHeader";
import FacilityReviews from "../../components/user/FacilityReviews";
import {
  loadCachedUserLocation,
  requestBrowserLocation,
} from "../../utils/userLocation";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [10.762622, 106.660172];
const EARTH_RADIUS_KM = 6371;

const currentLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      border-radius: 9999px;
      background: #2563eb;
      border: 4px solid #ffffff;
      box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.18), 0 6px 18px rgba(15, 23, 42, 0.28);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const getFacilityAddress = (facility) =>
  [facility?.dia_chi, facility?.phuong_xa, facility?.tinh_thanh]
    .filter(Boolean)
    .join(", ");

const getFacilityPosition = (facility) => {
  const lat = Number(facility?.vi_do);
  const lng = Number(facility?.kinh_do);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  if (lat === 0 && lng === 0) return null;

  return [lat, lng];
};

const getDirectionsUrl = (position) =>
  `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;

const getDistanceKm = (from, to) => {
  if (!from || !to) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

const formatDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) return "";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
};

const formatAccuracy = (accuracy) => {
  if (!Number.isFinite(accuracy)) return "";
  if (accuracy >= 1000) return `${(accuracy / 1000).toFixed(1)} km`;
  return `${Math.round(accuracy)} m`;
};

const toMapLocation = (location) =>
  location
    ? {
        position: [location.lat, location.lng],
        accuracy: location.accuracy,
      }
    : null;

function FitFacilityMarkers({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }

    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
  }, [map, positions]);

  return null;
}

export default function MapPage() {
  const cachedLocation = loadCachedUserLocation();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userLocation, setUserLocation] = useState(() =>
    toMapLocation(cachedLocation),
  );
  const [locationStatus, setLocationStatus] = useState(
    cachedLocation ? "cached" : "idle",
  );
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const res = await api.get("/co-so");
        setFacilities(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Loi lay danh sach co so:", error);
        setErrorMessage("Không thể tải danh sách cơ sở. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const requestCurrentLocation = async () => {
    setLocationStatus("loading");
    setLocationMessage("");
    try {
      const location = await requestBrowserLocation();
      setUserLocation(toMapLocation(location));
      setLocationStatus("granted");
    } catch (error) {
      setUserLocation(null);
      setLocationStatus("error");
      setLocationMessage(
        error.message || "Không thể lấy vị trí hiện tại. Vui lòng thử lại.",
      );
    }
  };

  const facilitiesWithPosition = useMemo(
    () =>
      facilities
        .map((facility) => ({
          ...facility,
          position: getFacilityPosition(facility),
        }))
        .filter((facility) => facility.position),
    [facilities],
  );

  const markerPositions = useMemo(
    () => facilitiesWithPosition.map((facility) => facility.position),
    [facilitiesWithPosition],
  );

  const mapPositions = useMemo(
    () =>
      userLocation
        ? [...markerPositions, userLocation.position]
        : markerPositions,
    [markerPositions, userLocation],
  );

  const selectedDistance = getDistanceKm(
    userLocation?.position,
    selectedFacility?.position,
  );

  return (
    <>
      <UserHeader />

      <main className="min-h-screen bg-[#f4f8ff] text-slate-800">
        <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Bản đồ cơ sở
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Chọn một cơ sở trên bản đồ để xem chi tiết.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {locationMessage && (
            <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {locationMessage}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={requestCurrentLocation}
                disabled={locationStatus === "loading"}
                title="Vị trí của tôi"
                className={`absolute right-4 top-4 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg transition hover:bg-blue-50 ${
                  locationStatus === "loading" ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <i
                  className={`fa-solid ${
                    locationStatus === "loading"
                      ? "fa-spinner fa-spin"
                      : "fa-location-crosshairs"
                  }`}
                ></i>
              </button>

              <MapContainer
                center={DEFAULT_CENTER}
                zoom={12}
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitFacilityMarkers positions={mapPositions} />

                {userLocation && (
                  <Marker
                    position={userLocation.position}
                    icon={currentLocationIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-blue-700">
                          Vị trí của bạn
                        </h3>
                        {Number.isFinite(userLocation.accuracy) && (
                          <p className="text-sm text-slate-600">
                            Sai số khoảng {formatAccuracy(userLocation.accuracy)}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {facilitiesWithPosition.map((facility) => (
                  <Marker
                    key={facility.id}
                    position={facility.position}
                    eventHandlers={{
                      click: () => setSelectedFacility(facility),
                    }}
                  >
                    <Popup>
                      <button
                        type="button"
                        onClick={() => setSelectedFacility(facility)}
                        className="block w-56 space-y-2 text-left"
                      >
                        <h3 className="text-base font-extrabold text-slate-900">
                          {facility.ten}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {getFacilityAddress(facility) ||
                            "Chưa cập nhật địa chỉ"}
                        </p>
                        <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                          Xem chi tiết
                        </span>
                      </button>
                      <a
                        href={getDirectionsUrl(facility.position)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Chỉ đường
                      </a>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <aside className="h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
                  Đang tải cơ sở...
                </div>
              ) : selectedFacility ? (
                <FacilityDetailPanel
                  facility={selectedFacility}
                  distanceKm={selectedDistance}
                  userLocation={userLocation}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Chọn cơ sở trên bản đồ
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Bấm vào marker của một cơ sở để xem ảnh, địa chỉ, khoảng
                    cách và nút đặt sân tại đây.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

    </>
  );
}

function FacilityDetailPanel({ facility, distanceKm, userLocation }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative h-52 flex-shrink-0 bg-gray-100">
        {facility.anh_chinh ? (
          <img
            src={getAssetUrl(facility.anh_chinh)}
            alt={facility.ten}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <i className="fa-regular fa-image text-4xl"></i>
          </div>
        )}

        <button
          type="button"
          className="absolute right-32 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-500 shadow-md"
          aria-label="Yêu thích"
        >
          <i className="fa-solid fa-heart"></i>
        </button>

        <Link
          to={`/dat-san/${facility.id}`}
          className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
        >
          Đặt sân
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </Link>

        {facility.position && (
          <a
            href={getDirectionsUrl(facility.position)}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
          >
            Chỉ đường
            <i className="fa-solid fa-route text-xs"></i>
          </a>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="border-b border-gray-100 p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#0a192f]">
                {facility.ten}
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <i className="fa-solid fa-medal"></i>
                {facility.so_san || 0} sân
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
              <div className="text-lg font-black text-emerald-600">
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="text-[10px] font-bold uppercase text-emerald-700">
                đánh giá
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p className="flex gap-3">
              <i className="fa-solid fa-location-dot mt-0.5 w-4 text-blue-600"></i>
              <span>{getFacilityAddress(facility) || "Chưa cập nhật địa chỉ"}</span>
            </p>
            <p className="flex gap-3">
              <i className="fa-solid fa-route mt-0.5 w-4 text-blue-600"></i>
              <span>
                {Number.isFinite(distanceKm)
                  ? `Cách bạn ${formatDistance(distanceKm)}`
                  : userLocation
                    ? "Cơ sở chưa có tọa độ để tính khoảng cách"
                    : "Bật vị trí để xem khoảng cách"}
              </span>
            </p>
            <p className="flex gap-3">
              <i className="fa-regular fa-clock mt-0.5 w-4 text-blue-600"></i>
              <span>05:00 - 23:00</span>
            </p>
            <p className="flex gap-3">
              <i className="fa-solid fa-circle-check mt-0.5 w-4 text-blue-600"></i>
              <span>Đang hoạt động</span>
            </p>
          </div>
        </section>

        <section className="border-b border-gray-100 p-5">
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-gray-900">
            Thông tin cơ sở
          </h3>
          <p className="text-sm leading-6 text-gray-600">
            {facility.mo_ta ||
              "Cơ sở cầu lông có không gian thoáng, phù hợp đặt sân theo giờ cho cá nhân và nhóm bạn."}
          </p>
        </section>

        <FacilityReviews facility={facility} />
      </div>
    </div>
  );
}
