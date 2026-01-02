// app/_layout.tsx
import { Slot, useRouter, useSegments, SplashScreen } from "expo-router";
import { useEffect } from "react";
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

  console.log("🔍 RootNavigator:", { token: !!token, checked, segments });

  useEffect(() => {
    if (!checked) return;

    const inAuthGroup = segments[0] === "(app)";
    const inSignIn = segments[0] === "signin";
    console.log("📍 Navigation check:", { inAuthGroup, inSignIn, hasToken: !!token });

    setTimeout(() => {
      if (!token) {
        // User is NOT authenticated
        if (!inSignIn) {
          // Redirect to signin if not already there
          console.log("➡️ Redirect to signin (not authenticated)");
          router.replace("/signin");
        }
      } else {
        // User IS authenticated
        if (!inAuthGroup) {
          // Redirect to app if not already in app group
          console.log("➡️ Redirect to app (authenticated)");
          router.replace("/(app)");
        }
      }

      SplashScreen.hideAsync();
    }, 0);
  }, [token, checked, segments]);

  if (!checked) {
    return null;
  }

  return <Slot />;
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