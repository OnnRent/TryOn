import { View, Text, StyleSheet, Alert, ActivityIndicator, Animated, Dimensions, Easing, TouchableOpacity, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../src/context/AuthContext";
import { router } from "expo-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useThemeColors, useIsDarkMode } from "../src/theme/colors";

WebBrowser.maybeCompleteAuthSession();

const DEV_MODE = __DEV__;

const { width, height } = Dimensions.get("window");

// Floating particle component
function FloatingParticle({ delay, startX, startY, isDark }: { delay: number; startX: number; startY: number; isDark: boolean }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 2000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    setTimeout(() => {
      floatAnimation.start();
      opacityAnimation.start();
    }, delay);

    return () => {
      floatAnimation.stop();
      opacityAnimation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          opacity: opacityAnim,
          backgroundColor: isDark ? "rgba(255,255,255,0.6)" : "rgba(100,126,234,0.5)",
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -30],
              }),
            },
            {
              translateX: floatAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 10, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const isAndroid = Platform.OS === "android";

// Custom hook to handle Google auth only on Android
function useGoogleAuth() {
  if (!isAndroid) {
    // Return null values for iOS - Google auth not used
    return [null, null, () => {}] as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    // Add your actual Google OAuth client ID above
  });
}

export default function SignInScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  // Google Auth setup (only used on Android)
  const [request, response, promptAsync] = useGoogleAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(80)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Orb floating animations
  const orb1Float = useRef(new Animated.Value(0)).current;
  const orb2Float = useRef(new Animated.Value(0)).current;
  const orb3Float = useRef(new Animated.Value(0)).current;

  // Title letter animations
  const letterAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  // Generate random particles
  const particles = useMemo(() =>
    [...Array(12)].map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      delay: i * 200,
    })), []
  );

  useEffect(() => {
    // Staggered entrance animations
    const entranceSequence = Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // Letter by letter animation for title
    const letterSequence = Animated.stagger(80,
      letterAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      )
    );

    // Button entrance
    const buttonEntrance = Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceSequence.start();
    setTimeout(() => letterSequence.start(), 400);
    buttonEntrance.start();

    // Continuous orb floating animations
    const createFloatAnimation = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

    createFloatAnimation(orb1Float, 4000).start();
    createFloatAnimation(orb2Float, 5000).start();
    createFloatAnimation(orb3Float, 3500).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  async function signInWithApple() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Get credentials from Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      // Send identity token to backend for verification
      const res = await fetch("https://api.tryonapp.in/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          fullName: credential.fullName
            ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
            : null,
          email: credential.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed with status ${res.status}`);
      }

      const data = await res.json();
      await login(data.token);
      router.replace("/(app)");
    } catch (e: any) {
      // Handle user cancellation gracefully
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User cancelled, do nothing
        return;
      }
      Alert.alert("Sign In Failed", e.message || "Unable to sign in. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  }

  // Google Sign-In (for Android)
  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      handleGoogleSignIn(response.authentication.accessToken);
    }
  }, [response]);

  async function handleGoogleSignIn(accessToken: string) {
    setIsLoading(true);
    try {
      // Send Google access token to backend for verification
      const res = await fetch("https://api.tryonapp.in/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed with status ${res.status}`);
      }

      const data = await res.json();
      await login(data.token);
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("Sign In Failed", e.message || "Unable to sign in. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (isLoading || !request) return;
    promptAsync();
  }

  // Development sign-in (only available in dev mode)
  async function signInDev() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("https://api.tryonapp.in/auth/dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          devSecret: "tryon-dev-2024",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed with status ${res.status}`);
      }

      const data = await res.json();
      await login(data.token);
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("Dev Sign In Failed", e.message || "Unable to sign in. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  }

  // Theme-aware gradient colors
  const gradientColors = isDark
    ? ["#0a0a0f", "#1a1a2e", "#16213e", "#0f0f23"] as const
    : ["#f8fafc", "#e2e8f0", "#f1f5f9", "#ffffff"] as const;

  const orbColors = isDark
    ? { primary: "#667eea", secondary: "#764ba2", tertiary: "#f093fb" }
    : { primary: "#3b82f6", secondary: "#8b5cf6", tertiary: "#ec4899" };

  const titleLetters = ["T", "r", "y", "O", "n"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          delay={particle.delay}
          startX={particle.x}
          startY={particle.y}
          isDark={isDark}
        />
      ))}

      {/* Animated Decorative Orbs with floating effect */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            backgroundColor: orbColors.primary,
            transform: [
              { scale: pulseAnim },
              {
                translateY: orb1Float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
              {
                translateX: orb1Float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
            ],
            opacity: isDark ? 0.2 : 0.25,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            backgroundColor: orbColors.secondary,
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [1.1, 0.9],
                }),
              },
              {
                translateY: orb2Float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
              {
                translateX: orb2Float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
            opacity: isDark ? 0.15 : 0.2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            backgroundColor: orbColors.tertiary,
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.85, 1.15],
                }),
              },
              {
                translateY: orb3Float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
              {
                rotate: orb3Float.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "10deg"],
                }),
              },
            ],
            opacity: isDark ? 0.12 : 0.18,
          },
        ]}
      />

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  {
                    rotate: logoRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-180deg", "0deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Animated glow rings */}
            <Animated.View
              style={[
                styles.logoGlowRing,
                styles.logoGlowRing1,
                {
                  opacity: glowAnim,
                  borderColor: isDark ? "#667eea" : "#3b82f6",
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.logoGlowRing,
                styles.logoGlowRing2,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0.2, 0.8],
                    outputRange: [0.8, 0.2],
                  }),
                  borderColor: isDark ? "#764ba2" : "#8b5cf6",
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [1.2, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
            {/* Main logo glow */}
            <Animated.View
              style={[
                styles.logoGlow,
                {
                  opacity: glowAnim,
                  backgroundColor: isDark ? "#667eea" : "#3b82f6",
                },
              ]}
            />
            <LinearGradient
              colors={isDark ? ["#667eea", "#764ba2"] : ["#3b82f6", "#8b5cf6"]}
              style={styles.logoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shirt-outline" size={52} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Animated Title - Letter by Letter */}
          <View style={styles.titleContainer}>
            {titleLetters.map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.logo,
                  { color: colors.textPrimary },
                  {
                    opacity: letterAnims[index],
                    transform: [
                      {
                        translateY: letterAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                      {
                        scale: letterAnims[index].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.5, 1.2, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>

          {/* Animated tagline with shimmer effect */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 3, 0],
                  }),
                },
              ],
            }}
          >
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              AI-Powered Virtual Fashion
            </Text>
          </Animated.View>
        </View>

        {/* Features with Glass Effect */}
        <BlurView
          intensity={isDark ? 25 : 50}
          tint={isDark ? "dark" : "light"}
          style={styles.featuresGlass}
        >
          <View
            style={[
              styles.featuresContainer,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
              },
            ]}
          >
            <FeatureItem icon="sparkles" text="AI Virtual Try-On" colors={colors} isDark={isDark} delay={0} />
            <FeatureItem icon="shirt" text="Digital Wardrobe" colors={colors} isDark={isDark} delay={150} />
            <FeatureItem icon="camera" text="Instant Results" colors={colors} isDark={isDark} delay={300} />
          </View>
        </BlurView>

        {/* Sign In Section with animation */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          {isLoading ? (
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={styles.loadingBlur}>
              <View
                style={[
                  styles.loadingContainer,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)",
                    borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <ActivityIndicator size="large" color={isDark ? "#667eea" : "#3b82f6"} />
                </Animated.View>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Signing you in...</Text>
              </View>
            </BlurView>
          ) : (
            <>
              {isAndroid ? (
                <TouchableOpacity
                  style={[styles.googleButton, { backgroundColor: isDark ? "#ffffff" : "#ffffff" }]}
                  onPress={signInWithGoogle}
                  disabled={!request}
                >
                  <View style={styles.googleIconContainer}>
                    <Text style={styles.googleIcon}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.appleButtonWrapper}>
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={
                      isDark
                        ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                        : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                    }
                    cornerRadius={16}
                    style={styles.appleBtn}
                    onPress={signInWithApple}
                  />
                </View>
              )}
              {DEV_MODE && (
                <TouchableOpacity
                  style={[styles.devButton, { backgroundColor: isDark ? "#374151" : "#e5e7eb" }]}
                  onPress={signInDev}
                >
                  <Ionicons name="code-slash" size={20} color={isDark ? "#fff" : "#1f2937"} />
                  <Text style={[styles.devButtonText, { color: isDark ? "#fff" : "#1f2937" }]}>
                    Dev Sign In (localhost)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
            By continuing, you agree to our{" "}
            <Text style={styles.linkText}>Terms</Text> &{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// Feature Item Component with animation
interface FeatureItemProps {
  icon: any;
  text: string;
  colors: any;
  isDark: boolean;
  delay: number;
}

function FeatureItem({ icon, text, colors, isDark, delay }: FeatureItemProps) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        delay: 500 + delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 600,
        delay: 500 + delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureItem,
        { opacity: fadeIn, transform: [{ translateX: slideIn }] },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#667eea", "#764ba2"] : ["#3b82f6", "#8b5cf6"]}
        style={styles.featureIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.featureText, { color: colors.textPrimary }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Floating particles
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Decorative orbs
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  orb1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  orb2: {
    width: width * 0.7,
    height: width * 0.7,
    bottom: height * 0.15,
    left: -width * 0.35,
  },
  orb3: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: -width * 0.15,
    right: -width * 0.1,
  },
  // Content layout
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: height * 0.12,
    paddingBottom: 50,
  },
  // Logo section
  logoSection: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  logoGlowRing: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 2,
  },
  logoGlowRing1: {
    width: 130,
    height: 130,
  },
  logoGlowRing2: {
    width: 160,
    height: 160,
    borderWidth: 1,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logo: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  // Features glass card
  featuresGlass: {
    borderRadius: 24,
    overflow: "hidden",
    marginVertical: 20,
  },
  featuresContainer: {
    padding: 24,
    gap: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    letterSpacing: 0.2,
  },
  // Button section
  buttonSection: {
    gap: 16,
  },
  loadingBlur: {
    borderRadius: 16,
    overflow: "hidden",
  },
  loadingContainer: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
  },
  appleButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  appleBtn: {
    width: "100%",
    height: 56,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 56,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    marginTop: 12,
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  privacyText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
    opacity: 0.7,
  },
  linkText: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
