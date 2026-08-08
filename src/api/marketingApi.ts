import apiClient from "@/lib/apiClient";

export interface MarketingStats {
  emailSubscribersCount: number;
  pushDevicesCount: number;
  liveBannersCount: number;
  monthlyReferralsCount: number;
}

export interface Campaign {
  _id?: string;
  id?: string;
  name: string;
  code?: string;
  title?: string;
  type: string;
  channel: string;
  status: string;
  targetAudience?: string;
  schedule?: {
    startDate?: string;
  };
  metrics?: {
    recipientsCount?: number;
    deliveredCount?: number;
    openedCount?: number;
    clickedCount?: number;
  };
}

export interface Banner {
  _id?: string;
  id?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  targetUrl?: string;
  deepLink?: string;
  placement?: string;
  displayOrder?: number;
  deviceTarget?: string;
  status?: string;
}

export interface CampaignResponse {
  data: Campaign[];
  total?: number;
}

export interface BannerResponse {
  data: Banner[];
  total?: number;
}

export const getMarketingStats = async (): Promise<MarketingStats> => {
  const response = await apiClient.get("/api/v1/marketing/campaigns/stats");
  return response.data?.data || response.data;
};

export const getCampaigns = async (params?: { search?: string; type?: string; channel?: string; status?: string; page?: number; limit?: number }): Promise<CampaignResponse> => {
  const response = await apiClient.get("/api/v1/marketing/campaigns", { params });
  return response.data?.data || response.data;
};

export const getBanners = async (params?: { search?: string; placement?: string; status?: string; page?: number; limit?: number }): Promise<BannerResponse> => {
  const response = await apiClient.get("/api/v1/marketing/banners", { params });
  return response.data?.data || response.data;
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const response = await apiClient.get(`/api/v1/marketing/campaigns/${id}`);
  return response.data?.data || response.data;
};

export const createCampaign = async (campaign: Partial<Campaign>): Promise<Campaign> => {
  const response = await apiClient.post("/api/v1/marketing/campaigns", campaign);
  return response.data?.data || response.data;
};

export const updateCampaign = async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
  const response = await apiClient.patch(`/api/v1/marketing/campaigns/${id}`, campaign);
  return response.data?.data || response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/marketing/campaigns/${id}`);
};

export const getBannerById = async (id: string): Promise<Banner> => {
  const response = await apiClient.get(`/api/v1/marketing/banners/${id}`);
  return response.data?.data || response.data;
};

export const createBanner = async (banner: Partial<Banner>): Promise<Banner> => {
  const response = await apiClient.post("/api/v1/marketing/banners", banner);
  return response.data?.data || response.data;
};

export const updateBanner = async (id: string, banner: Partial<Banner>): Promise<Banner> => {
  const response = await apiClient.patch(`/api/v1/marketing/banners/${id}`, banner);
  return response.data?.data || response.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/marketing/banners/${id}`);
};
