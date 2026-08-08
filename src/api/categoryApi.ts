import apiClient from "../lib/apiClient";

export interface CategoryPayload {
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  image?: string;
  status: "visible" | "hidden";
}

export interface CategoryResponse extends CategoryPayload {
  _id: string; // MongoDB typical ID
  id?: string; // Fallback
  productsCount?: number;
  subCategories?: CategoryResponse[];
}

export const getCategories = async (params?: { parentId?: string; q?: string; page?: number; limit?: number }): Promise<{ categories: CategoryResponse[], pagination: any }> => {
  const response = await apiClient.get("/api/v1/storefront/admin/categories", { params });
  return response.data?.data || response.data;
};

export const createCategory = async (payload: CategoryPayload) => {
  const response = await apiClient.post("/api/v1/storefront/admin/categories", payload);
  return response.data;
};

export const updateCategory = async (id: string, payload: Partial<CategoryPayload>) => {
  const response = await apiClient.put(`/api/v1/storefront/admin/categories/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/storefront/admin/categories/${id}`);
  return response.data;
};
