// app/_layout.tsx
import { Slot, useRouter, useSegments, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme/colors";

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
    console.log("📍 Navigation check:", { inAuthGroup, hasToken: !!token });

    setTimeout(() => {
      if (!token && inAuthGroup) {
        console.log("➡️ Redirect to signin");
        router.replace("/signin");
      } else if (token && !inAuthGroup) {
        console.log("➡️ Redirect to app");
        router.replace("/(app)");
      }
      
      SplashScreen.hideAsync();
    }, 0);
  }, [token, checked]);

  if (!checked) {
    return null;
  }

  return <Slot />;
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}