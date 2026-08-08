import apiClient from "../lib/apiClient";

export interface Review {
  id: string;
  productName?: string;
  customerName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  adminReply?: string;
}

export interface ReviewResponse {
  data: Review[];
  total: number;
}

export const getReviews = async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<ReviewResponse> => {
  const response = await apiClient.get("/api/v1/reviews/admin", { params });
  return response.data?.data || response.data;
};

export const moderateReview = async (id: string, payload: { status?: "approved" | "rejected"; adminReply?: string }) => {
  const response = await apiClient.patch(`/api/v1/reviews/admin/${id}`, payload);
  return response.data;
};
