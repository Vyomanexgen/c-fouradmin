import apiClient from "@/lib/apiClient";

export interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
  minPurchaseAmount?: number;
  applicableProducts?: string[];
}

export interface CouponResponse {
  coupons?: Coupon[];
  data?: Coupon[];
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  total?: number;
}

export const getCoupons = async (params?: { page?: number; limit?: number; status?: string }): Promise<CouponResponse> => {
  const response = await apiClient.get("/api/v1/coupons", { params });
  return response.data?.data || response.data;
};

export const createCoupon = async (data: Partial<Coupon>): Promise<Coupon> => {
  const response = await apiClient.post("/api/v1/coupons", data);
  return response.data?.data || response.data;
};

export const updateCoupon = async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
  const response = await apiClient.patch(`/api/v1/coupons/${id}`, data);
  return response.data?.data || response.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/coupons/${id}`);
};
