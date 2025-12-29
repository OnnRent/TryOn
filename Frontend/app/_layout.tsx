// app/_layout.tsx
import { Slot, usePathname, router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme/colors";

function Root() {
  const { token, checked } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!checked) return;

    if (!token && pathname !== "/signin") {
      router.replace("/signin");
    }

    if (token && pathname === "/signin") {
      router.replace("/"); // go to app
    }
  }, [token, checked, pathname]);

  if (!checked) return null;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Slot />
    </View>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
