"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import api from "@/utils/api";
import { useAuth } from "./AuthContexts";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface ProfileContextType {
  user: User | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const clearProfile = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const refreshProfile = async () => {
    if (!token) {
      clearProfile();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/api/v1/profile");
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Profile fetch error:", error);
      clearProfile();
    } finally {
      setLoading(false);
    }
  };

  const initProfile = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        clearProfile();
      }
    } catch (error) {
      console.error("Profile init error:", error);
      clearProfile();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      initProfile();
    }
  }, [token]);

  const value: ProfileContextType = {
    user,
    loading,
    refreshProfile,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined || context === null) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
