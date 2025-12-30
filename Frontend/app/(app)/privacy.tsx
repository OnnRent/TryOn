import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/theme/colors";
import { router } from "expo-router";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Last Updated: December 30, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to TryOn ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          
          <Text style={styles.subTitle}>2.1 Personal Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we collect:
          </Text>
          <Text style={styles.bulletPoint}>• Email address</Text>
          <Text style={styles.bulletPoint}>• Apple ID (if using Sign in with Apple)</Text>
          <Text style={styles.bulletPoint}>• Account creation date</Text>

          <Text style={styles.subTitle}>2.2 Photos and Images</Text>
          <Text style={styles.paragraph}>
            We collect and process:
          </Text>
          <Text style={styles.bulletPoint}>• Photos you upload of yourself</Text>
          <Text style={styles.bulletPoint}>• Photos of clothing items you add to your wardrobe</Text>
          <Text style={styles.bulletPoint}>• Generated virtual try-on images</Text>

          <Text style={styles.subTitle}>2.3 Usage Data</Text>
          <Text style={styles.paragraph}>
            We automatically collect:
          </Text>
          <Text style={styles.bulletPoint}>• Device information (model, OS version)</Text>
          <Text style={styles.bulletPoint}>• App usage statistics</Text>
          <Text style={styles.bulletPoint}>• Error logs and crash reports</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide virtual try-on services</Text>
          <Text style={styles.bulletPoint}>• Store and manage your wardrobe items</Text>
          <Text style={styles.bulletPoint}>• Improve our AI algorithms and app features</Text>
          <Text style={styles.bulletPoint}>• Send important updates and notifications</Text>
          <Text style={styles.bulletPoint}>• Provide customer support</Text>
          <Text style={styles.bulletPoint}>• Detect and prevent fraud or abuse</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely using industry-standard practices:
          </Text>
          <Text style={styles.bulletPoint}>• Encrypted cloud storage (AWS S3)</Text>
          <Text style={styles.bulletPoint}>• Secure database with encryption at rest</Text>
          <Text style={styles.bulletPoint}>• HTTPS/TLS encryption for data in transit</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do NOT sell your personal information. We may share data only in these limited circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
          <Text style={styles.bulletPoint}>• With service providers (AWS, analytics) under strict agreements</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal data</Text>
          <Text style={styles.bulletPoint}>• Request data correction or deletion</Text>
          <Text style={styles.bulletPoint}>• Export your data</Text>
          <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
          <Text style={styles.bulletPoint}>• Delete your account and all associated data</Text>
          <Text style={styles.paragraph}>
            To exercise these rights, contact us at privacy@tryon.app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your data for as long as your account is active. When you delete your account:
          </Text>
          <Text style={styles.bulletPoint}>• All photos are permanently deleted within 30 days</Text>
          <Text style={styles.bulletPoint}>• Personal information is anonymized</Text>
          <Text style={styles.bulletPoint}>• Backups are purged within 90 days</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            TryOn is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by:
          </Text>
          <Text style={styles.bulletPoint}>• Posting the new policy in the app</Text>
          <Text style={styles.bulletPoint}>• Sending an email notification</Text>
          <Text style={styles.bulletPoint}>• Displaying an in-app notice</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions or concerns about this Privacy Policy, please contact us:
          </Text>
          <Text style={styles.bulletPoint}>• Email: privacy@tryon.app</Text>
          <Text style={styles.bulletPoint}>• Support: support@tryon.app</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using TryOn, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    paddingLeft: 8,
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});

