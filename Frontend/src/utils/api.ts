// src/utils/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://try-on-xi.vercel.app";

export const api = {
  auth: {
    dev: async () => {
      const res = await fetch(`${API_URL}/auth/dev`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Dev login failed");
      return res.json();
    },

    apple: async (identityToken: string) => {
      const res = await fetch(`${API_URL}/auth/apple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identityToken }),
      });
      if (!res.ok) throw new Error("Apple login failed");
      return res.json();
    },

    // Optional: Call backend on logout
    logout: async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Logout API call failed:", err);
        // Continue with local logout anyway
      }
    },
  },
};