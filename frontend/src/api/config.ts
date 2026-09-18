// Default targets the backend's local dev port (backend/src/index.ts).
// On a physical device via Expo Go, "localhost" resolves to the phone, not
// this machine — set EXPO_PUBLIC_API_URL to this computer's LAN IP
// (e.g. http://192.168.0.10:4000) when testing on a real phone.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
