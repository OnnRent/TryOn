
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme/colors";
import { router } from "expo-router";
import { useState } from "react";

export default function SignInScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithApple() {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "dev@tryon.app",
          fullName: "Dev User",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Got token, logging in...");

      await login(data.token);

      console.log("✅ Login successful, navigating...");
      router.replace("/(app)");

    } catch (e: any) {
      console.error("Sign in error:", e);
      Alert.alert(
        "Sign In Failed",
        e.message || "Unable to sign in. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TryOn</Text>
      <Text style={styles.tagline}>AI fashion that fits you</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.textPrimary} />
          <Text style={styles.loadingText}>Signing in...</Text>
        </View>
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={28}
          style={styles.appleBtn}
          onPress={signInWithApple}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 38,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  loadingContainer: {
    width: "100%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  appleBtn: {
    width: "100%",
    height: 56,
  },
});
