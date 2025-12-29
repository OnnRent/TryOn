// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { api } from "../utils/api";

type AuthContextType = {
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checked: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("token");
        if (saved) {
          setToken(saved);
        }
      } catch (err) {
        console.error("Failed to load token:", err);
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  async function login(jwt: string) {
    try {
      await AsyncStorage.setItem("token", jwt);
      setToken(jwt);
    } catch (err) {
      console.error("Failed to save token:", err);
      setToken(jwt);
    }
  }

  async function logout() {
    try {
      // Optional: Call backend logout API
      await api.auth.logout();
    } catch (err) {
      console.error("Backend logout failed:", err);
    }

    try {
      await AsyncStorage.removeItem("token");
    } catch (err) {
      console.error("Failed to remove token:", err);
    } finally {
      setToken(null);
      router.replace("/signin");
    }
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, checked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}