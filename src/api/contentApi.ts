import apiClient from "@/lib/apiClient";

export interface ContentItem {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  type: "banner" | "page" | "blog" | "faq" | "policy";
  category?: string;
  excerpt?: string;
  content?: string;
  author?: {
    name?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  status: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ContentResponse {
  data: ContentItem[];
  total?: number;
}

export const getContentItems = async (params?: { type?: string; status?: string; category?: string; placement?: string; search?: string; page?: number; limit?: number }): Promise<ContentResponse> => {
  const response = await apiClient.get("/api/v1/content", { params });
  return response.data?.data || response.data;
};

export const getContentItemById = async (id: string): Promise<ContentItem> => {
  const response = await apiClient.get(`/api/v1/content/${id}`);
  return response.data?.data || response.data;
};

export const createContentItem = async (contentItem: Partial<ContentItem>): Promise<ContentItem> => {
  const response = await apiClient.post("/api/v1/content", contentItem);
  return response.data?.data || response.data;
};

export const updateContentItem = async (id: string, contentItem: Partial<ContentItem>): Promise<ContentItem> => {
  const response = await apiClient.patch(`/api/v1/content/${id}`, contentItem);
  return response.data?.data || response.data;
};

export const deleteContentItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/content/${id}`);
};
