// app/_layout.tsx
import { Slot, useRouter, useSegments, SplashScreen } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useThemeColors, useIsDarkMode } from "../src/theme/colors";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { token, checked } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  console.log("🔍 RootNavigator:", { token: !!token, checked, segments });

  useEffect(() => {
    if (!checked || hasNavigated) return;

    const inAuthGroup = segments[0] === "(app)";
    const inSignIn = segments[0] === "signin";
    console.log("📍 Navigation check:", { inAuthGroup, inSignIn, hasToken: !!token });

    if (!token) {
      if (!inSignIn) {
        console.log("➡️ Redirect to signin (not authenticated)");
        router.replace("/signin");
      }
    } else {
      if (!inAuthGroup) {
        console.log("➡️ Redirect to app (authenticated)");
        router.replace("/(app)");
      }
    }

    setHasNavigated(true);
  }, [token, checked, segments, hasNavigated]);

  // Hide splash only when layout is ready and navigation is complete
  useEffect(() => {
    if (isLayoutReady && hasNavigated) {
      // Small delay to ensure screen is rendered
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLayoutReady, hasNavigated]);

  const onLayoutReady = useCallback(() => {
    setIsLayoutReady(true);
  }, []);

  if (!checked) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutReady}>
      <Slot />
    </View>
  );
}

export default function Layout() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}