import apiClient from "../lib/apiClient";

export interface PaymentGatewayPayload {
  isActive: boolean;
  keyId: string;
  secret: string;
  webhookSecret?: string;
}

export interface PaymentGatewayResponse {
  provider: "razorpay" | "cashfree" | "stripe";
  isActive: boolean;
  keyId: string;
  webhookSecret?: string;
}

export const getPaymentGateways = async () => {
  const response = await apiClient.get("/api/v1/settings/payment-gateways");
  return response.data;
};

export const updatePaymentGateway = async (
  provider: "razorpay" | "cashfree" | "stripe",
  payload: PaymentGatewayPayload
) => {
  const response = await apiClient.put(`/api/v1/settings/payment-gateways/${provider}`, payload);
  return response.data;
};
