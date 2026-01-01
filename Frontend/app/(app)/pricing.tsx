import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/theme/colors";
import { router } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dynamically import Razorpay only if available (development build)
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require("react-native-razorpay").default;
} catch (e) {
  // Razorpay not available in Expo Go
  console.log("Razorpay SDK not available - using fallback");
}

// Production API URL
const API_URL = "https://api.tryonapp.in";

type PricingTier = {
  id: string;
  name: string;
  price: number;
  tryons: number;
  popular?: boolean;
};

const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tryons: 3,
  },
  {
    id: "starter",
    name: "Starter Pack",
    price: 499,
    tryons: 15,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: 699,
    tryons: 25,
  },
];

export default function PricingScreen() {
  const [loading, setLoading] = useState(false);
  const [processingPackage, setProcessingPackage] = useState<string | null>(null);

  const handleSelectPlan = (tier: PricingTier) => {
    if (tier.id === "free") {
      Alert.alert(
        "Free Tier",
        "All new users start with 3 free try-ons! Sign up to get started.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      `${tier.name}`,
      `Purchase ${tier.tryons} try-ons for ₹${tier.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase",
          onPress: () => initiatePayment(tier),
        },
      ]
    );
  };

  const initiatePayment = async (tier: PricingTier) => {
    try {
      setLoading(true);
      setProcessingPackage(tier.id);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login to continue");
        return;
      }

      // Create Razorpay order
      console.log("📤 Creating order for package:", tier.id);
      const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ package_id: tier.id }),
      });

      console.log("📥 Order Response:", {
        status: orderResponse.status,
        ok: orderResponse.ok,
        headers: Object.fromEntries(orderResponse.headers.entries()),
      });
      console.log("Order Response:", orderResponse);
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.log("❌ Order creation failed:", orderResponse.status, errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error || `Server error (${orderResponse.status}): ${error.message || 'Unknown error'}`);
        } catch (e) {
          throw new Error(`Server error (${orderResponse.status}): ${errorText.substring(0, 100) || 'No error message'}`);
        }
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay payment
      openRazorpayCheckout(orderData, tier, token);
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      Alert.alert("Error", error.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
      setProcessingPackage(null);
    }
  };

  const openRazorpayCheckout = async (orderData: any, tier: PricingTier, token: string) => {
    // Check if Razorpay SDK is available (development build)
    if (RazorpayCheckout) {
      // Use native Razorpay SDK
      const options = {
        description: `${tier.name} - ${tier.tryons} try-ons`,
        image: 'https://your-logo-url.com/logo.png', // Replace with your app logo
        currency: orderData.currency,
        key: orderData.key_id,
        amount: orderData.amount,
        name: 'TryOn',
        order_id: orderData.order_id,
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name'
        },
        theme: { color: '#D4AF37' }
      };

      RazorpayCheckout.open(options)
        .then((data: any) => {
          // Payment successful - verify with backend
          console.log("✅ Payment successful:", data);
          verifyPayment(data, token);
        })
        .catch((error: any) => {
          // Payment failed or cancelled
          console.log("❌ Payment failed:", error);
          if (error.code !== 0) { // 0 = user cancelled
            Alert.alert('Payment Failed', error.description || 'Payment was cancelled');
          }
        });
    } else {
      // Fallback: Show error message for Expo Go users
      Alert.alert(
        "Development Build Required",
        "To use Razorpay payments, you need to create a development build of this app.\n\nExpo Go doesn't support native payment modules.\n\nWould you like instructions on how to create a development build?",
        [
          {
            text: "Show Instructions",
            onPress: () => {
              Alert.alert(
                "Create Development Build",
                "Run these commands:\n\n1. npx expo install expo-dev-client\n2. npx expo prebuild\n3. npx expo run:ios (or run:android)\n\nOr build with EAS:\neas build --profile development --platform ios"
              );
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  const verifyPayment = async (paymentData: any, token: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Payment verification failed");
      }

      const result = await response.json();

      Alert.alert(
        "Success! 🎉",
        `${result.tryons_added} try-ons added to your account!\n\nTotal available: ${result.total_available}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Payment verification error:", error);
      Alert.alert("Error", error.message || "Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Processing payment...</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pricing Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Create. Try. Repeat.</Text>
          <Text style={styles.heroSubtitle}>
            Explore styles, refine details, and bring your{"\n"}fashion vision to life.
          </Text>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          {PRICING_TIERS.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              onPress={() => handleSelectPlan(tier)}
              activeOpacity={0.8}
              style={[
                styles.pricingCard,
                tier.popular && styles.popularCard,
              ]}
            >
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <Text style={styles.tierName}>{tier.name}</Text>

              <View style={styles.priceRow}>
                {tier.price === 0 ? (
                  <Text style={styles.price}>Free</Text>
                ) : (
                  <>
                    <Text style={styles.currency}>₹ </Text>
                    <Text style={styles.price}>{tier.price.toLocaleString()}</Text>
                    <Text style={styles.period}> / One-time</Text>
                  </>
                )}
              </View>

              <Text style={styles.tryonsText}>
                {tier.price === 0
                  ? `Get ${tier.tryons} free try-ons to start your journey`
                  : `Unlock ${tier.tryons} stunning virtual try-ons`
                }
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}> • </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 24,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 8,
  },
  pricingCard: {
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  popularCard: {
    borderColor: "#D4AF37",
    borderWidth: 3,
  },
  popularBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
  },
  tierName: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  currency: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  period: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  tryonsText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  footerLink: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textDecorationLine: "underline",
  },
  footerDot: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

