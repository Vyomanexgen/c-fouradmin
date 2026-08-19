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
  try {
    const response = await apiClient.get("/api/v1/admin/catalog/products", { params });
    const products = response.data?.data || response.data || [];
    const items = Array.isArray(products) ? products : (products.products || products.data || []);
    const mapped = items.map((p: any) => {
      const qty = p.defaultVariant?.stockQuantity ?? p.totalStock ?? 0;
      let status = "in_stock";
      if (qty === 0) status = "out_of_stock";
      else if (qty < 10) status = "low_stock";
      
      return {
        id: p._id || p.id,
        sku: p.defaultVariant?.sku || p.sku || "N/A",
        quantity: qty,
        status,
        name: p.name
      };
    });

    return {
      data: mapped,
      total: response.data?.pagination?.totalItems || response.data?.total || mapped.length
    };
  } catch (err) {
    // fallback if API fails
    return { data: [], total: 0 };
  }
};

export const adjustStock = async (id: string, payload: { quantity: number; reason: string }) => {
  const response = await apiClient.post(`/api/v1/inventory/${id}/adjust`, payload);
  return response.data;
};

export const receiveStock = async (id: string, payload: { quantity: number; costPerUnit: number }) => {
  const response = await apiClient.post(`/api/v1/inventory/${id}/receive`, payload);
  return response.data;
};
