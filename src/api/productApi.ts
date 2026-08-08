import apiClient from "@/lib/apiClient";

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Variant {
  _id?: string;
  id?: string;
  sku: string;
  originalPrice: number;
  offerPrice?: number;
  stockQuantity: number;
  attributes?: ProductAttribute[];
  images?: string[];
  isActive?: boolean;
}

export interface ProductResponse {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  status: "active" | "draft" | "archived";
  category?: { _id: string; name: string };
  categoryId?: string;
  totalStock?: number;
  defaultVariant?: Variant;
  variants?: Variant[];
  images?: string[];
  description?: string;
  brand?: string;
  tags?: string[];
  pageTitle?: string;
  metaDescription?: string;
  trackInventory?: boolean;
}

// Flat payload used for "Smart Creation"
export interface CreateProductPayload {
  name: string;
  slug: string;
  status: "active" | "draft" | "archived";
  categoryId?: string;
  description?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  pageTitle?: string;
  metaDescription?: string;
  trackInventory?: boolean;
  
  // Root level fields for smart creation of default variant
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
  sku?: string;
  barcode?: string;
  
  // Or explicitly provide variants array
  variants?: Variant[];
}

export interface GetProductsParams {
  categoryId?: string;
  q?: string;
  status?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
}

export const getProducts = async (params?: GetProductsParams) => {
  const response = await apiClient.get("/api/v1/storefront/admin/products", { params });
  return response.data?.data || response.data;
};

export const getProductById = async (id: string) => {
  const response = await apiClient.get(`/api/v1/storefront/admin/products/${id}`);
  return response.data?.data || response.data;
};

export const createProduct = async (payload: CreateProductPayload) => {
  const response = await apiClient.post("/api/v1/storefront/admin/products", payload);
  return response.data;
};

export const updateProduct = async (id: string, payload: Partial<CreateProductPayload>) => {
  const response = await apiClient.put(`/api/v1/storefront/admin/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/storefront/admin/products/${id}`);
  return response.data;
};

// Variant Management Endpoints

export interface CreateVariantPayload extends Variant {
  productId: string;
}

export const createVariant = async (payload: CreateVariantPayload) => {
  const response = await apiClient.post("/api/v1/storefront/admin/variants", payload);
  return response.data;
};

export const updateVariant = async (id: string, payload: Partial<CreateVariantPayload>) => {
  const response = await apiClient.put(`/api/v1/storefront/admin/variants/${id}`, payload);
  return response.data;
};

export const deleteVariant = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/storefront/admin/variants/${id}`);
  return response.data;
};
