const USER_LOCATION_KEY = "badminton_user_location";
const LOCATION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined";

const isLocalhost = () =>
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const normalizeLocation = (location) => {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  const accuracy = Number(location?.accuracy);
  const savedAt = Number(location?.savedAt);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  if (!Number.isFinite(savedAt)) return null;

  return {
    lat,
    lng,
    accuracy: Number.isFinite(accuracy) ? accuracy : null,
    savedAt,
  };
};

export const loadCachedUserLocation = () => {
  if (!isBrowser()) return null;

  try {
    const cached = normalizeLocation(
      JSON.parse(window.localStorage.getItem(USER_LOCATION_KEY)),
    );

    if (!cached) return null;
    if (Date.now() - cached.savedAt > LOCATION_MAX_AGE_MS) return null;

    return cached;
  } catch {
    return null;
  }
};

export const saveCachedUserLocation = ({ lat, lng, accuracy }) => {
  if (!isBrowser()) return null;

  const location = normalizeLocation({
    lat,
    lng,
    accuracy,
    savedAt: Date.now(),
  });

  if (!location) return null;

  window.localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
  return location;
};

export const getLocationErrorMessage = (error) => {
  if (error?.code === error?.PERMISSION_DENIED || error?.code === 1) {
    return "Bạn đang chặn quyền vị trí. Hãy mở quyền Location trong cài đặt trang rồi thử lại.";
  }

  if (error?.code === error?.POSITION_UNAVAILABLE || error?.code === 2) {
    return "Không xác định được vị trí hiện tại. Hãy bật GPS/Wi-Fi rồi thử lại.";
  }

  if (error?.code === error?.TIMEOUT || error?.code === 3) {
    return "Lấy vị trí quá lâu. Hãy thử lại hoặc đứng nơi có tín hiệu tốt hơn.";
  }

  return "Không thể lấy vị trí hiện tại. Vui lòng thử lại.";
};

export const requestBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!isBrowser() || !navigator.geolocation) {
      reject(new Error("Trình duyệt không hỗ trợ lấy vị trí hiện tại."));
      return;
    }

    if (!window.isSecureContext && !isLocalhost()) {
      reject(
        new Error(
          "Trình duyệt chỉ cho lấy vị trí trên HTTPS hoặc localhost. Hãy mở bằng localhost hoặc deploy HTTPS.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = saveCachedUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        if (!location) {
          reject(new Error("Vị trí nhận được không hợp lệ."));
          return;
        }

        resolve(location);
      },
      (error) => {
        reject(new Error(getLocationErrorMessage(error)));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5 * 60 * 1000,
        timeout: 15000,
      },
    );
  });
