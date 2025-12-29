import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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
      const saved = await AsyncStorage.getItem("token");
      if (saved) setToken(saved);
      setChecked(true);
    })();
  }, []);

  async function login(jwt: string) {
    await AsyncStorage.setItem("token", jwt);
    setToken(jwt);
    router.replace("/"); 
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    setToken(null);
    router.replace("/signin");
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
