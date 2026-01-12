import api from "./api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REFRESH_EXPIRES_AT_KEY = "refresh_expires_at";

export function saveToken(accessToken, refreshToken, refreshExpiresAt) {
  if (!refreshExpiresAt) return;
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem(
    "refresh_expires_at",
    new Date(refreshExpiresAt).toISOString(),
  );
}

let logoutTimeout = null;

export function initAuth() {
  const refreshToken = getRefreshToken();
  const refreshExpiresAt = localStorage.getItem(REFRESH_EXPIRES_AT_KEY);

  if (!refreshToken || !refreshExpiresAt) return;

  const expiresAt = new Date(refreshExpiresAt).getTime();
  const expiresInMs = expiresAt - Date.now();

  if (Number.isNaN(expiresAt) || expiresInMs <= 0) {
    return;
  }

  if (logoutTimeout) {
    clearTimeout(logoutTimeout);
  }

  logoutTimeout = setTimeout(logout, expiresInMs);
  return true;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function logout() {
  clearTokens();
  if (logoutTimeout) clearTimeout(logoutTimeout);
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_EXPIRES_AT_KEY);
}

export async function login(email, password) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });
  return res.data;
}

export function getUserFromToken() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export function isAdmin() {
  const user = getUserFromToken();
  return user?.role === "admin";
}
