import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUserProfile, createUserProfile, loginUser as loginApi, logoutUser as logoutApi } from "../api/authApi";
import { useToast } from "./ToastContext";

export interface UserProfile {
  id: string;
  authUserId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  avatar?: string;
  organizationId?: string;
  isTemporarySession?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const logoutLocal = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    setUser(null);
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getCurrentUserProfile();
      const profile = data.data || data;
      
      // Ensure the profile has email and role from token if missing in profile record
      let emailVal = profile.email;
      let roleVal = profile.role;
      let orgIdVal = profile.organizationId;
      
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (!emailVal) emailVal = payload.email;
            if (!roleVal) roleVal = payload.role;
            if (!orgIdVal) orgIdVal = payload.organizationId;
          } catch (e) {
            console.error("Failed to parse token payload", e);
          }
        }
      }

      setUser({
        ...profile,
        email: emailVal,
        role: roleVal || "Administrator",
        organizationId: orgIdVal,
      });
    } catch (err: any) {
      const status = err.response?.status;
      const isProfileNotFound = status === 404;

      if (isProfileNotFound) {
        try {
          let fName = "Admin";
          let lName = "User";
          
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (payload.email) {
                  const emailName = payload.email.split("@")[0];
                  fName = emailName || "Admin";
                }
              } catch (e) {
                console.error("Failed to decode token", e);
              }
            }
          }
          
          const createData = await createUserProfile(fName, lName);
          const newProfile = createData.data || createData;
          
          let emailVal = newProfile.email;
          let roleVal = newProfile.role;
          let orgIdVal = newProfile.organizationId;
          
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                if (!emailVal) emailVal = payload.email;
                if (!roleVal) roleVal = payload.role;
                if (!orgIdVal) orgIdVal = payload.organizationId;
              } catch (e) {
                // ignore
              }
            }
          }

          setUser({
            ...newProfile,
            email: emailVal,
            role: roleVal || "Administrator",
            organizationId: orgIdVal,
          });
          return;
        } catch (createErr) {
          console.error("Auto-creating admin profile failed", createErr);
        }
      }

      // Handle 401 and 403 by clearing session locally
      if (status === 401 || status === 403 || isProfileNotFound) {
        logoutLocal();
      } else {
        // Fallback for SSR / Network errors to prevent forced logout
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("accessToken");
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              setUser({
                id: payload.userId || payload.id,
                email: payload.email,
                role: payload.role || "Administrator",
                organizationId: payload.organizationId,
                isTemporarySession: true
              });
            } catch (decodeErr) {
              logoutLocal();
            }
          } else {
            logoutLocal();
          }
        } else {
          setLoading(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    const payload = data.data || data;
    
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", payload.accessToken);
      if (payload.refreshToken) {
        localStorage.setItem("refreshToken", payload.refreshToken);
      }
    }
    
    await fetchProfile();
    toast.success("Login successful. Welcome to Admin Console!");
    return payload;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Server logout error", err);
    } finally {
      logoutLocal();
      toast.success("Logged out successfully.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        fetchProfile();
      } else {
        setLoading(false);
      }

      // Listen to the session-expired event
      const handleAuthExpired = () => {
        logoutLocal();
        toast.error("Session expired. Please log in again.");
      };

      window.addEventListener("auth-expired", handleAuthExpired);
      return () => {
        window.removeEventListener("auth-expired", handleAuthExpired);
      };
    } else {
      setLoading(false);
    }
  }, [logoutLocal]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
