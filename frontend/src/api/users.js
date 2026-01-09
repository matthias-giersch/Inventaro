import api from "./api";

export async function getUsers() {
  const res = await api.get("/auth/users");
  return res.data;
}

export async function promoteUserToAdmin(userId) {
  const res = await api.post(`/auth/users/${userId}/make-admin`);
  return res.data;
}

export async function promoteAdminToUser(userId) {
  const res = await api.post(`/auth/users/${userId}/make-user`);
  return res.data;
}

export async function deleteUser(userId) {
  return await api.delete(`/auth/users/${userId}/delete-user`);
}
