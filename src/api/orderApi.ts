import apiClient from "../lib/apiClient";

export interface OrderItem {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  amount: number;
  payment: "paid" | "unpaid" | "refunded";
  fulfillment: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
}

export interface OrderResponse {
  data: OrderItem[];
  total: number;
}

export const getOrders = async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<OrderResponse> => {
  const response = await apiClient.get("/api/v1/orders/admin", { params });
  return response.data?.data || response.data;
};

export const getOrderById = async (id: string) => {
  const response = await apiClient.get(`/api/v1/orders/admin/${id}`);
  return response.data?.data || response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await apiClient.patch(`/api/v1/orders/admin/${id}/status`, { status });
  return response.data;
};

export const updateOrderTracking = async (id: string, payload: { trackingNumber: string; courierName: string; trackingUrl: string; adminNotes: string }) => {
  const response = await apiClient.patch(`/api/v1/orders/admin/${id}/tracking`, payload);
  return response.data;
};
