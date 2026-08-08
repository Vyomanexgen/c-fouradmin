import apiClient from "../lib/apiClient";

export interface AnalyticsKpi {
  value: number;
  changePercentage: number;
  isPositive: boolean;
}

export interface DashboardResponse {
  kpis: {
    totalRevenue: AnalyticsKpi;
    totalOrders: AnalyticsKpi;
    totalCustomers: AnalyticsKpi;
    totalProducts: AnalyticsKpi;
    pendingOrders: AnalyticsKpi;
    lowStock: AnalyticsKpi;
    conversionRate: AnalyticsKpi;
    avgOrderValue: AnalyticsKpi;
  };
  revenueTrend: Array<{ label: string; value: number; orders?: number }>;
  salesByCategory: Array<{ category: string; value: number; percentage: number }>;
  ordersByMonth: Array<{ label: string; value: number; orders?: number }>;
  customerGrowth: Array<{ period: string; newCustomers: number; returningCustomers: number }>;
  topSellingProducts: Array<{ id: string; name: string; category: string; unitsSold: number; price: number; revenue: number }>;
  inventoryAlerts: Array<{ id: string; name: string; sku: string; status: string; stockCount: number }>;
  recentOrders: Array<{ id: string; orderNumber: string; customerName: string; date: string; paymentStatus: string; fulfillmentStatus: string; amount: number }>;
}

export const analyticsApi = {
  getDashboard: async (params?: { period?: string; startDate?: string; endDate?: string }): Promise<DashboardResponse> => {
    const response = await apiClient.get("/api/v1/analytics/dashboard", { params });
    return response.data?.data || response.data;
  },

  getOverview: async (): Promise<any> => {
    const response = await apiClient.get("/api/v1/analytics/overview");
    return response.data?.data || response.data;
  },

  getRealtime: async (): Promise<any> => {
    const response = await apiClient.get("/api/v1/analytics/realtime");
    return response.data?.data || response.data;
  },

  getCustomersAnalytics: async (): Promise<any> => {
    const response = await apiClient.get("/api/v1/analytics/customers");
    return response.data?.data || response.data;
  },

  exportReport: async (params?: { period?: string }) => {
    const response = await apiClient.get("/api/v1/analytics/export", { 
      params, 
      responseType: "blob" // We request as blob to handle potential PDF/CSV downloads
    });
    return response;
  }
};
