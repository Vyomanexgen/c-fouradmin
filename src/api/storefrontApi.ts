import apiClient from "../lib/apiClient";

export interface HeroBanner {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  ctaText?: string;
  isActive: boolean;
}

export interface StorefrontConfig {
  heroSection?: {
    banners: HeroBanner[];
    featuredProductIds: string[];
  };
  aboutUs?: {
    title: string;
    description: string;
    image: string;
  };
  footer?: {
    quickLinks: { name: string; url: string }[];
    contactUs: {
      address: string;
      phone: string;
      email: string;
      hours: string;
    };
    copyrightText: string;
  };
  socialLinks?: { platform: string; url: string }[];
}

export interface ContactSubmission {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
}

export interface ContactSubmissionsResponse {
  success: boolean;
  data: {
    submissions: ContactSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const queryKeys = {
  storefrontConfig: ["storefront-config"],
  contactInquiries: (filters: Record<string, any>) => ["contact-inquiries", filters],
};

export const getStorefrontConfig = async () => {
  const response = await apiClient.get("/api/v1/admin/catalog/config");
  return response.data;
};

export const updateStorefrontConfig = async (payload: Partial<StorefrontConfig>) => {
  const response = await apiClient.put("/api/v1/admin/catalog/config", payload);
  return response.data;
};

export const getContactSubmissions = async (params: { page?: number; limit?: number; status?: string }) => {
  const response = await apiClient.get("/api/v1/admin/catalog/contact-submissions", { params });
  return response.data as ContactSubmissionsResponse;
};

export const updateSubmissionStatus = async ({ id, status }: { id: string; status: 'pending' | 'read' | 'replied' }) => {
  const response = await apiClient.patch(`/api/v1/admin/catalog/contact-submissions/${id}`, { status });
  return response.data;
};
