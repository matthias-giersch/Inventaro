import api from "./api";

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export async function login(email, password) {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  localStorage.setItem("token", res.data.access_token);
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function getUserFromToken() {
  const token = localStorage.getItem("token");
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
