import apiClient from "../lib/apiClient";

export const loginUser = async (email: string, password: string) => {
  const response = await apiClient.post("/api/v1/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/api/v1/auth/logout");
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await apiClient.get("/api/v1/users/me");
  return response.data;
};

export const createUserProfile = async (firstName: string, lastName: string) => {
  const response = await apiClient.post("/api/v1/users/profile", {
    firstName,
    lastName,
  });
  return response.data;
};
