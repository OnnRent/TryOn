import { View, Text, StyleSheet, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../src/context/AuthContext";
import { router } from "expo-router";
import { COLORS } from "../src/theme/colors";
import { BlurView } from "expo-blur";

export default function SignInScreen() {
  const { login } = useAuth();

  async function handleAppleSignIn() {
    try {
      const credential =
        await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

      // ✅ Save user in auth context
      login({
        id: credential.user,
        email: credential.email ?? undefined,
        name: credential.fullName
          ? `${credential.fullName.givenName ?? ""} ${
              credential.fullName.familyName ?? ""
            }`.trim()
          : undefined,
      });

      // 🚀 Go to Home
      router.replace("/");
    } catch (e: any) {
      if (e.code === "ERR_CANCELED") {
        // User cancelled → do nothing
        return;
      }
      console.error("Apple Sign In error", e);
    }
  }

  return (
    <View style={styles.container}>
      {/* Glass card */}
      <BlurView intensity={40} tint="dark" style={styles.card}>
        <Text style={styles.logo}>TryOn</Text>
        <Text style={styles.subtitle}>
          Sign in to continue
        </Text>

        {/* Apple Sign In (iOS ONLY) */}
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            }
            cornerRadius={14}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "88%",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },

  appleButton: {
    width: 260,
    height: 50,
  },
});
