import apiClient from "../lib/apiClient";

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
}

export const notificationApi = {
  getNotifications: async (params?: { type?: string; isRead?: boolean; page?: number; limit?: number }): Promise<NotificationResponse> => {
    const response = await apiClient.get("/api/v1/notifications", { params });
    return response.data?.data || response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/api/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch(`/api/v1/notifications/mark-all-read`);
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/notifications/${id}`);
    return response.data;
  }
};
