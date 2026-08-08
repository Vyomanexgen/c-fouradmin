import apiClient from "../lib/apiClient";

export interface Customer {
  id: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  totalSpent?: number;
  ordersCount?: number;
  status?: "active" | "blocked" | string;
  isActive?: boolean;
  isBlocked?: boolean;
  createdAt: string;
}

export interface CustomerResponse {
  data: Customer[];
  total: number;
}

export const getCustomers = async (params?: { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: "asc" | "desc" }): Promise<CustomerResponse> => {
  const response = await apiClient.get("/api/v1/customers/admin", { params });
  return response.data?.data || response.data;
};

export const updateCustomerStatus = async (id: string, status: "active" | "blocked") => {
  const response = await apiClient.patch(`/api/v1/customers/admin/${id}/status`, { status });
  return response.data;
};
