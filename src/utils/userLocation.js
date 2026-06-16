const USER_LOCATION_KEY = "badminton_user_location";
const LOCATION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined";

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
