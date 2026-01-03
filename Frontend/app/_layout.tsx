// app/_layout.tsx
import { Slot, useRouter, useSegments, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useThemeColors, useIsDarkMode } from "../src/theme/colors";
import { Video, ResizeMode } from "expo-av";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { token, checked } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

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

      // Hide native splash and show animated splash
      SplashScreen.hideAsync();

      // Hide animated splash after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowAnimatedSplash(false);
        });
      }, 3000);
    }, 0);
  }, [token, checked, segments]);

  if (!checked) {
    return null;
  }

  // Show animated splash screen
  if (showAnimatedSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        {/* MP4 Video Splash */}
        <Video
          source={require('../assets/splash.mp4')}
          style={styles.splashVideo}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping={false}
          isMuted
        />
      </Animated.View>
    );
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000', // Change to your brand color
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashVideo: {
    width: '100%',
    height: '100%',
  },
});