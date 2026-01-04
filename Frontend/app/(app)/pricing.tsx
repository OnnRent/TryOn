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
import { useThemeColors } from "../../src/theme/colors";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useIAP,
  finishTransaction,
  getReceiptIOS,
  type Product,
  type Purchase,
  type PurchaseError,
  ErrorCode,
} from "react-native-iap";

// Apple IAP Product IDs
const APPLE_PRODUCTS = {
  basic: "com.vanshkarnwal.tryoapp.basic",
  pro: "com.vanshkarnwal.tryonapp.pro",
};

const productIds = [APPLE_PRODUCTS.basic, APPLE_PRODUCTS.pro];

type PricingTier = {
  id: string;
  name: string;
  price: number;
  priceDisplay?: string;
  tryons: number;
  popular?: boolean;
  appleProductId?: string;
};

const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tryons: 3,
  },
  {
    id: "basic",
    name: "Basic",
    price: 499,
    tryons: 15,
    popular: true,
    appleProductId: APPLE_PRODUCTS.basic,
  },
  {
    id: "pro",
    name: "Pro",
    price: 699,
    tryons: 25,
    appleProductId: APPLE_PRODUCTS.pro,
  },
];

export default function PricingScreen() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState<string | null>(null);

  // Handle purchase success
  const handlePurchaseSuccess = useCallback(async (purchase: Purchase) => {
    console.log("Purchase success:", purchase);
    await verifyAndFinishPurchase(purchase);
  }, []);

  // Handle purchase error
  const handlePurchaseError = useCallback((error: PurchaseError) => {
    console.error("Purchase error:", error);
    if (error.code !== ErrorCode.UserCancelled) {
      Alert.alert("Purchase Failed", error.message || "Something went wrong. Please try again.");
    }
    setLoading(null);
  }, []);

  // Use the IAP hook
  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
  });

  // Load products when connected
  useEffect(() => {
    const loadProducts = async () => {
      if (connected && Platform.OS === "ios") {
        console.log("📱 IAP Connected, fetching products:", productIds);
        await fetchProducts({ skus: productIds, type: "in-app" });
      }
    };
    loadProducts();
  }, [connected, fetchProducts]);

  // Debug: Log products when they change
  useEffect(() => {
    console.log("📦 Available products:", products.map(p => ({ id: p.id, price: p.displayPrice })));
    if (products.length === 0 && connected) {
      console.warn("⚠️ No products found! Check App Store Connect configuration.");
    }
  }, [products, connected]);

  const verifyAndFinishPurchase = async (purchase: Purchase) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please log in again");
        setLoading(null);
        return;
      }

      // Get receipt data for iOS
      let receiptData: string | null = null;
      if (Platform.OS === "ios") {
        try {
          receiptData = await getReceiptIOS();
        } catch (e) {
          console.warn("Could not get receipt:", e);
        }
      }

      // Send to backend for verification
      const response = await fetch("https://api.tryonapp.in/iap/apple/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiptData: receiptData,
          productId: purchase.productId,
          transactionId: purchase.transactionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Finish the transaction
      await finishTransaction({ purchase, isConsumable: true });

      Alert.alert(
        "Success! 🎉",
        `${data.credits_added} try-ons added!\n\nYour balance: ${data.available_tryons} try-ons`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Purchase verification error:", error);
      Alert.alert("Error", error.message || "Failed to verify purchase");
    } finally {
      setLoading(null);
    }
  };

  const handleApplePurchase = async (tier: PricingTier) => {
    if (!tier.appleProductId) return;

    try {
      setLoading(tier.id);
      await requestPurchase({
        request: {
          apple: { sku: tier.appleProductId },
        },
        type: "in-app",
      });
      // Purchase listener will handle the rest
    } catch (error: any) {
      console.error("Apple purchase error:", error);
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert("Purchase Error", error.message || "Failed to start purchase");
      }
      setLoading(null);
    }
  };

  const handleSelectPlan = async (tier: PricingTier) => {
    if (tier.id === "free") {
      Alert.alert(
        "Free Tier",
        "All new users start with 3 free try-ons! Sign up to get started.",
        [{ text: "OK" }]
      );
      return;
    }

    // Use Apple IAP on iOS
    if (Platform.OS === "ios" && tier.appleProductId) {
      handleApplePurchase(tier);
      return;
    }

    // Android/fallback flow (simple credits add for now)
    Alert.alert(
      "Get Credits",
      `Add ${tier.tryons} try-ons to your account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Add Credits",
          onPress: async () => {
            try {
              setLoading(tier.id);

              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Error", "Please log in again");
                return;
              }

              const response = await fetch("https://api.tryonapp.in/credits/add", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  package_id: tier.id,
                  tryons: tier.tryons,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Failed to add credits");
              }

              Alert.alert(
                "Success! 🎉",
                `${data.credits_added} try-ons added!\n\nYour balance: ${data.available_tryons} try-ons`,
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error: any) {
              console.error("Add credits error:", error);
              Alert.alert("Error", error.message || "Failed to add credits");
            } finally {
              setLoading(null);
            }
          },
        },
      ]
    );
  };

  // Get price from Apple if available
  const getDisplayPrice = (tier: PricingTier) => {
    if (Platform.OS === "ios" && tier.appleProductId) {
      const product = products.find((p: Product) => p.id === tier.appleProductId);
      if (product) {
        return product.displayPrice;
      }
    }
    return `₹${tier.price}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Pricing Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Create. Try. Repeat.</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
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
              disabled={loading === tier.id}
              style={[
                styles.pricingCard,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                tier.popular && styles.popularCard,
                loading === tier.id && { opacity: 0.7 },
              ]}
            >
              {loading === tier.id && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              )}

              {tier.popular && (
                <View style={[styles.popularBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <Text style={[styles.tierName, { color: colors.textPrimary }]}>{tier.name}</Text>

              <View style={styles.priceRow}>
                {tier.price === 0 ? (
                  <Text style={[styles.price, { color: colors.textPrimary }]}>Free</Text>
                ) : (
                  <>
                    <Text style={[styles.price, { color: colors.textPrimary }]}>{getDisplayPrice(tier)}</Text>
                  </>
                )}
              </View>

              <Text style={[styles.tryonsText, { color: colors.textSecondary }]}>
                {tier.price === 0
                  ? `Get ${tier.tryons} free try-ons to start`
                  : `${tier.tryons} try-ons per month`
                }
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={[styles.footerDot, { color: colors.textSecondary }]}> • </Text>
          <TouchableOpacity>
            <Text style={[styles.footerLink, { color: colors.textSecondary }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 8,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  popularCard: {
    borderColor: "#D4AF37",
    borderWidth: 3,
  },
  popularBadge: {
    position: "absolute",
    top: 16,
    right: 16,
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
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
  },
  period: {
    fontSize: 14,
  },
  tryonsText: {
    fontSize: 14,
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
    textDecorationLine: "underline",
  },
  footerDot: {
    fontSize: 13,
  },
});
