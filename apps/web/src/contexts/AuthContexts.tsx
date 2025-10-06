"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import api from "@/utils/api";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post("/api/v1/auth/signin", {
        email,
        password,
      });
      
      const { token: authToken } = response.data;
      
      setToken(authToken);
      localStorage.setItem("token", authToken);
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      const response = await api.post("/api/v1/auth/signup", {
        email,
        password,
        name,
      });
      
      const { token: authToken } = response.data;
      
      setToken(authToken);
      localStorage.setItem("token", authToken);
      
      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Signup failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const initAuth = () => {
    try {
      const storedToken = localStorage.getItem("token");
      
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Auth init error:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const value: AuthContextType = {
    user: null, 
    token,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}