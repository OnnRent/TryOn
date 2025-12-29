import { View, Text, StyleSheet } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme/colors";
import { router } from "expo-router";

export default function SignInScreen() {
  const { login } = useAuth();

  async function signInWithApple() {
    try {
      const res = await fetch("http://localhost:3000/auth/dev", {
        method: "POST"
      });
      
      if (!res.ok) {
        console.error("Login failed:", res.status);
        return;
      }
      
      const data = await res.json();
      console.log("✅ Got token, logging in...");
      
      await login(data.token);
      
      console.log("✅ Login successful, navigating...");
      router.replace("/(app)"); // ✅ Note the trailing slash

    } catch (e) {
      console.error("Sign in error:", e);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TryOn</Text>
      <Text style={styles.tagline}>AI fashion that fits you</Text>

      <AppleAuthentication.AppleAuthenticationButton
        buttonType={
          AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
        }
        buttonStyle={
          AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
        }
        cornerRadius={28}
        style={styles.appleBtn}
        onPress={signInWithApple}
      />
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
  appleBtn: {
    width: "100%",
    height: 56,
  },
});