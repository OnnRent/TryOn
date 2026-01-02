import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../src/theme/colors";
import { router } from "expo-router";

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
    id: "basic",
    name: "Basic",
    price: 499,
    tryons: 15,
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 699,
    tryons: 25,
  },
];

export default function PricingScreen() {
  const colors = useThemeColors();

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
      "Coming Soon",
      `Payment integration for ${tier.name} (₹${tier.price}/month) will be available soon!\n\nYou'll get ${tier.tryons} try-ons per month.`,
      [{ text: "OK" }]
    );
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
              style={[
                styles.pricingCard,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                tier.popular && styles.popularCard,
              ]}
            >
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
                    <Text style={[styles.currency, { color: colors.textPrimary }]}>₹</Text>
                    <Text style={[styles.price, { color: colors.textPrimary }]}>{tier.price}</Text>
                    <Text style={[styles.period, { color: colors.textSecondary }]}>/month</Text>
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
