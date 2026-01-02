import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useIsDarkMode } from "../../src/theme/colors";
import { router } from "expo-router";

export default function TermsOfServiceScreen() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: December 30, 2024</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            By accessing and using TryOn ("the App"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Description of Service</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            TryOn is a virtual try-on application that uses artificial intelligence to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Allow users to virtually try on clothing items</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Store and manage a digital wardrobe</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Generate AI-powered try-on images</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Import clothing from product links</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. User Accounts</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>3.1 Account Creation</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You must create an account to use the App. You agree to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Provide accurate and complete information</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Maintain the security of your account credentials</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Notify us immediately of any unauthorized access</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Be responsible for all activities under your account</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>3.2 Account Eligibility</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You must be at least 13 years old to use TryOn. By creating an account, you represent that you meet this age requirement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. User Content and Conduct</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>4.1 Your Content</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You retain ownership of photos and content you upload. By uploading content, you grant us a license to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Store and process your photos</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Generate virtual try-on images</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Improve our AI algorithms (anonymized)</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>4.2 Prohibited Content</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You agree NOT to upload:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Illegal, harmful, or offensive content</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Content that violates others' rights</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Nudity or sexually explicit material</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Spam or malicious content</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Content depicting minors inappropriately</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>5. Intellectual Property</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>5.1 Our Rights</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            The App, including its design, features, and technology, is owned by TryOn and protected by intellectual property laws. You may not:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Copy, modify, or distribute the App</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Reverse engineer or decompile the App</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Remove copyright or trademark notices</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Use our branding without permission</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>5.2 Generated Images</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            AI-generated try-on images are provided for your personal use only. You may not use them for commercial purposes without our written consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>6. Acceptable Use</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You agree to use the App only for lawful purposes. You must not:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Violate any laws or regulations</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Interfere with the App's operation</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Attempt to gain unauthorized access</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Use automated tools to access the App</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Impersonate others or misrepresent affiliation</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>7. AI-Generated Content Disclaimer</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Virtual try-on images are generated by AI and may not be 100% accurate. We do not guarantee:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Perfect fit or appearance representation</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Color accuracy</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Fabric texture representation</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Generated images are for visualization purposes only and should not be the sole basis for purchasing decisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>8. Privacy and Data</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Your use of the App is also governed by our Privacy Policy. By using TryOn, you consent to our collection and use of your data as described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>9. Fees and Payments</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            TryOn is currently free to use. We reserve the right to introduce paid features or subscriptions in the future. If we do:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• We will provide advance notice</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Existing features may remain free or become paid</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Refund policies will be clearly stated</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>10. Disclaimers and Limitations</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>10.1 Service "As Is"</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            The App is provided "as is" without warranties of any kind. We do not guarantee:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Uninterrupted or error-free service</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Accuracy of AI-generated results</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Compatibility with all devices</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Data backup or recovery</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>10.2 Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            To the maximum extent permitted by law, TryOn shall not be liable for:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Indirect, incidental, or consequential damages</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Loss of data, profits, or business opportunities</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Damages arising from use or inability to use the App</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Third-party actions or content</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>11. Termination</Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>11.1 By You</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You may terminate your account at any time by deleting it through the App settings.
          </Text>

          <Text style={[styles.subTitle, { color: colors.textPrimary }]}>11.2 By Us</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We may suspend or terminate your account if you:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Violate these Terms</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Engage in fraudulent or illegal activity</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Upload prohibited content</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Abuse or misuse the service</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>12. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We may modify these Terms at any time. We will notify you of material changes by:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Posting updated Terms in the App</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Sending email notifications</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Displaying in-app notices</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Continued use of the App after changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>13. Governing Law</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            These Terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration or in courts of competent jurisdiction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>14. Contact Information</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            For questions about these Terms, contact us:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Email: legal@tryon.app</Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Support: support@tryon.app</Text>
        </View>

        <View style={[styles.footer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By using TryOn, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 8,
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});

