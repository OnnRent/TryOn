import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/theme/colors";
import { router } from "expo-router";
import { BlurView } from "expo-blur";

export default function SupportScreen() {
  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@tryon.app?subject=TryOn Support Request");
  };

  const handleReportBug = () => {
    Linking.openURL("mailto:support@tryon.app?subject=Bug Report - TryOn App");
  };

  const handleFeatureRequest = () => {
    Linking.openURL("mailto:support@tryon.app?subject=Feature Request - TryOn App");
  };

  const handleFAQ = (question: string, answer: string) => {
    Alert.alert(question, answer, [{ text: "OK" }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <TouchableOpacity onPress={handleEmailSupport} activeOpacity={0.7}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="mail-outline" size={24} color="#3b82f6" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Email Support</Text>
                  <Text style={styles.cardDescription}>support@tryon.app</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReportBug} activeOpacity={0.7}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="bug-outline" size={24} color="#ef4444" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Report a Bug</Text>
                  <Text style={styles.cardDescription}>Help us improve</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFeatureRequest} activeOpacity={0.7}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>Feature Request</Text>
                  <Text style={styles.cardDescription}>Share your ideas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <TouchableOpacity
            onPress={() =>
              handleFAQ(
                "How do I add clothes to my wardrobe?",
                "You can add clothes by:\n\n1. Tapping the '+' button on the Wardrobe screen\n2. Taking photos of the front and back of your clothing\n3. Or importing from a product link\n\nMake sure to take clear photos with good lighting for best results."
              )
            }
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.faqQuestion}>How do I add clothes to my wardrobe?</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleFAQ(
                "How does virtual try-on work?",
                "Our AI-powered virtual try-on:\n\n1. Analyzes your uploaded photos\n2. Processes clothing items from your wardrobe\n3. Generates realistic try-on images\n\nThe process takes a few moments and results are saved to your Generated Photos."
              )
            }
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.faqQuestion}>How does virtual try-on work?</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleFAQ(
                "Can I delete items from my wardrobe?",
                "Yes! To delete an item:\n\n1. Go to the Wardrobe screen\n2. Long press on the item you want to delete\n3. Confirm deletion\n\nDeleted items cannot be recovered, so make sure before confirming."
              )
            }
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.faqQuestion}>Can I delete items from my wardrobe?</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleFAQ(
                "Is my data secure?",
                "Absolutely! We take your privacy seriously:\n\n• All photos are encrypted\n• Secure cloud storage\n• No sharing with third parties\n• You can delete your data anytime\n\nSee our Privacy Policy for more details."
              )
            }
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardItem}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.faqQuestion}>Is my data secure?</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.cardItem}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.cardLabel}>Version</Text>
              <Text style={styles.cardValue}>1.0.0</Text>
            </View>
          </BlurView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});

