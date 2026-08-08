import apiClient from "../lib/apiClient";

export interface ConfigData {
  storeInfo?: {
    name?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    defaultLanguage?: string;
    defaultCurrency?: string;
  };
  chargeTax?: boolean;
  taxRate?: number;
  platformFee?: number;
  handlingFee?: number;
  shippingFee?: number;
  freeShippingThreshold?: number;
  multiStoreMode?: boolean;
  shippingZones?: Array<{
    name: string;
    regions: string[];
    rate: number;
  }>;
  email?: {
    fromName?: string;
    replyToAddress?: string;
    provider?: string;
  };
  notifications?: {
    orderPlaced?: boolean;
    orderPaid?: boolean;
    orderProcessing?: boolean;
    orderShipped?: boolean;
    orderOutForDelivery?: boolean;
    orderDelivered?: boolean;
    orderCancelled?: boolean;
    orderReturned?: boolean;
    orderRefunded?: boolean;
    promotionalEmails?: boolean;
  };
}

export const getOrganizationConfig = async () => {
  const response = await apiClient.get("/api/v1/settings");
  return response.data;
};

export const updateOrganizationConfig = async (payload: ConfigData) => {
  const response = await apiClient.patch("/api/v1/settings", payload);
  return response.data;
};
