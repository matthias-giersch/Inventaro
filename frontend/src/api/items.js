import api from "./api";

export async function getItems(categoryId) {
  const response = await api.get(`/items/${categoryId}`);
  return response.data;
}

export async function createItem(categoryId, data) {
  const response = await api.post(`/items/${categoryId}`, data);
  return response.data;
}

export async function updateItem(itemId, data) {
  const response = await api.put(`/items/${itemId}`, data);
  return response.data;
}

export async function deleteItem(itemId) {
  return await api.delete(`/items/${itemId}`);
}
