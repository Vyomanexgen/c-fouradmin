import React, { createContext, useContext, useEffect, useCallback } from "react";
import { toast as sonnerToast } from "sonner";

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const success = useCallback((msg: string) => {
    sonnerToast.success(msg);
  }, []);

  const error = useCallback((msg: string) => {
    sonnerToast.error(msg);
  }, []);

  const warning = useCallback((msg: string) => {
    sonnerToast.warning(msg);
  }, []);

  const info = useCallback((msg: string) => {
    sonnerToast.info(msg);
  }, []);

  const toast = { success, error, warning, info };

  // Listen to global API errors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleApiError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string; status?: number }>;
      const { message, status } = customEvent.detail || {};
      let toastMessage = message;

      if (status === 401) {
        toastMessage = "Session expired. Please log in again.";
      } else if (status === 403) {
        toastMessage = "Access denied. You do not have permission.";
      } else if (status === 404) {
        toastMessage = "Requested resource not found.";
      } else if (status === 500) {
        toastMessage = "Internal Server Error. Please try again later.";
      } else if (!status) {
        toastMessage = message || "Network error. Please check your internet connection.";
      }

      if (toastMessage) {
        sonnerToast.error(toastMessage);
      }
    };

    window.addEventListener("api-error", handleApiError);
    return () => {
      window.removeEventListener("api-error", handleApiError);
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
