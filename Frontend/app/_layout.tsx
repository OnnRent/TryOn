import { Slot, usePathname, router } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlassTabBar from "../src/components/GlassTabBar";
import { COLORS } from "../src/theme/colors";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  const pathname = usePathname();

  const hideTabBar =
    pathname === "/camera" || pathname === "/signin";

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <Slot />

          {!hideTabBar && (
            <GlassTabBar
              activePath={pathname}
              onNavigate={(path) => router.push(path)}
            />
          )}
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
