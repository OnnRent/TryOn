import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/theme/colors";
import { router } from "expo-router";

export default function SignInScreen() {
  const { login } = useAuth();

  async function signInWithApple() {
    try {
      // const credential = await AppleAuthentication.signInAsync({
      //   requestedScopes: [
      //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
      //   ],
      // });

      // const res = await fetch("http://localhost:3000/auth/apple", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     identityToken: credential.identityToken,
      //   }),
      // });

      // 🟢 DEV 
      const res = await fetch("http://localhost:3000/auth/dev", {
        method: "POST"
      });
      console.log("Apple Sign In response status:", res);
      const data = await res.json();
      await login(data.token);

      router.replace("/"); // 🔥 THIS WAS MISSING

    } catch (e) {
      console.log("Apple Sign In cancelled or failed", e);
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
