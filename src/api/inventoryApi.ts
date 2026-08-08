import apiClient from "../lib/apiClient";

export interface InventoryItem {
  id: string; // Add id to allow targeting for adjust/receive
  sku: string;
  quantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryResponse {
  data: InventoryItem[];
  total: number;
}

export const getInventory = async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<InventoryResponse> => {
  const response = await apiClient.get("/api/v1/inventory", { params });
  return response.data?.data || response.data;
};

export const adjustStock = async (id: string, payload: { quantity: number; reason: string }) => {
  const response = await apiClient.post(`/api/v1/inventory/${id}/adjust`, payload);
  return response.data;
};

export const receiveStock = async (id: string, payload: { quantity: number; costPerUnit: number }) => {
  const response = await apiClient.post(`/api/v1/inventory/${id}/receive`, payload);
  return response.data;
};
