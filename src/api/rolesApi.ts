import apiClient from "../lib/apiClient";

export interface Permission {
  module?: string;
  feature?: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  modulePermissions: Permission[];
  featurePermissions: Permission[];
  organizationId: string;
  createdAt: string;
}

export interface SystemModule {
  _id: string;
  name: string;
  description: string;
  features: Array<{
    name: string;
    description: string;
  }>;
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get("/api/v1/roles");
  return response.data?.data || response.data;
};

export const createRole = async (data: Partial<Role>) => {
  const response = await apiClient.post("/api/v1/roles", data);
  return response.data;
};

export const updateRole = async (id: string, data: Partial<Role>) => {
  const response = await apiClient.put(`/api/v1/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await apiClient.delete(`/api/v1/roles/${id}`);
  return response.data;
};

export const getSystemModules = async (): Promise<SystemModule[]> => {
  const response = await apiClient.get("/api/v1/roles/modules");
  return response.data?.data || response.data;
};
