import { View, Text, StyleSheet, Alert, ActivityIndicator, Animated } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../src/context/AuthContext";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SignInScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  async function signInWithApple() {
    if (isLoading) return;

    setIsLoading(true);
    console.log("Attempting to sign in...");
    try {
      const res = await fetch("https://api.tryonapp.in/auth/dev", {
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
      {/* Animated Background Circles */}
      <View style={styles.backgroundCircles}>
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            {
              transform: [{
                scale: pulseAnim.interpolate({
                  inputRange: [1, 1.05],
                  outputRange: [1.05, 1],
                })
              }],
            }
          ]}
        />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
              }
            ]}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="shirt-outline" size={56} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Text style={styles.logo}>TryOn</Text>
          <Text style={styles.tagline}>AI-Powered Virtual Fashion</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="camera-outline"
            text="Try clothes virtually with AI"
            delay={0}
          />
          <FeatureItem
            icon="images-outline"
            text="Build your digital wardrobe"
            delay={100}
          />
          <FeatureItem
            icon="sparkles-outline"
            text="See yourself in any outfit"
            delay={200}
          />
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Signing you in...</Text>
            </View>
          ) : (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={16}
              style={styles.appleBtn}
              onPress={signInWithApple}
            />
          )}

          <Text style={styles.privacyText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

// Feature Item Component with animation
function FeatureItem({ icon, text, delay }: { icon: any; text: string; delay: number }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        delay: 400 + delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 600,
        delay: 400 + delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureItem,
        {
          opacity: fadeIn,
          transform: [{ translateX: slideIn }],
        }
      ]}
    >
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.08,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: "#FFFFFF",
    top: -100,
    right: -100,
  },
  circle2: {
    width: 350,
    height: 350,
    backgroundColor: "#FFFFFF",
    bottom: -80,
    left: -80,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 60,
  },
  logoSection: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333333",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 17,
    color: "#888888",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  featuresContainer: {
    gap: 24,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#333333",
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 18,
  },
  loadingContainer: {
    width: "100%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#333333",
  },
  loadingText: {
    fontSize: 15,
    color: "#888888",
    fontWeight: "500",
  },
  appleBtn: {
    width: "100%",
    height: 56,
  },
  privacyText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
