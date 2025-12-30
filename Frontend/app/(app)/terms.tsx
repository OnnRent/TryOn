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

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Last Updated: December 30, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using TryOn ("the App"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            TryOn is a virtual try-on application that uses artificial intelligence to:
          </Text>
          <Text style={styles.bulletPoint}>• Allow users to virtually try on clothing items</Text>
          <Text style={styles.bulletPoint}>• Store and manage a digital wardrobe</Text>
          <Text style={styles.bulletPoint}>• Generate AI-powered try-on images</Text>
          <Text style={styles.bulletPoint}>• Import clothing from product links</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          
          <Text style={styles.subTitle}>3.1 Account Creation</Text>
          <Text style={styles.paragraph}>
            You must create an account to use the App. You agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate and complete information</Text>
          <Text style={styles.bulletPoint}>• Maintain the security of your account credentials</Text>
          <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized access</Text>
          <Text style={styles.bulletPoint}>• Be responsible for all activities under your account</Text>

          <Text style={styles.subTitle}>3.2 Account Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 13 years old to use TryOn. By creating an account, you represent that you meet this age requirement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Content and Conduct</Text>
          
          <Text style={styles.subTitle}>4.1 Your Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of photos and content you upload. By uploading content, you grant us a license to:
          </Text>
          <Text style={styles.bulletPoint}>• Store and process your photos</Text>
          <Text style={styles.bulletPoint}>• Generate virtual try-on images</Text>
          <Text style={styles.bulletPoint}>• Improve our AI algorithms (anonymized)</Text>

          <Text style={styles.subTitle}>4.2 Prohibited Content</Text>
          <Text style={styles.paragraph}>
            You agree NOT to upload:
          </Text>
          <Text style={styles.bulletPoint}>• Illegal, harmful, or offensive content</Text>
          <Text style={styles.bulletPoint}>• Content that violates others' rights</Text>
          <Text style={styles.bulletPoint}>• Nudity or sexually explicit material</Text>
          <Text style={styles.bulletPoint}>• Spam or malicious content</Text>
          <Text style={styles.bulletPoint}>• Content depicting minors inappropriately</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          
          <Text style={styles.subTitle}>5.1 Our Rights</Text>
          <Text style={styles.paragraph}>
            The App, including its design, features, and technology, is owned by TryOn and protected by intellectual property laws. You may not:
          </Text>
          <Text style={styles.bulletPoint}>• Copy, modify, or distribute the App</Text>
          <Text style={styles.bulletPoint}>• Reverse engineer or decompile the App</Text>
          <Text style={styles.bulletPoint}>• Remove copyright or trademark notices</Text>
          <Text style={styles.bulletPoint}>• Use our branding without permission</Text>

          <Text style={styles.subTitle}>5.2 Generated Images</Text>
          <Text style={styles.paragraph}>
            AI-generated try-on images are provided for your personal use only. You may not use them for commercial purposes without our written consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree to use the App only for lawful purposes. You must not:
          </Text>
          <Text style={styles.bulletPoint}>• Violate any laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Interfere with the App's operation</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access</Text>
          <Text style={styles.bulletPoint}>• Use automated tools to access the App</Text>
          <Text style={styles.bulletPoint}>• Impersonate others or misrepresent affiliation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. AI-Generated Content Disclaimer</Text>
          <Text style={styles.paragraph}>
            Virtual try-on images are generated by AI and may not be 100% accurate. We do not guarantee:
          </Text>
          <Text style={styles.bulletPoint}>• Perfect fit or appearance representation</Text>
          <Text style={styles.bulletPoint}>• Color accuracy</Text>
          <Text style={styles.bulletPoint}>• Fabric texture representation</Text>
          <Text style={styles.paragraph}>
            Generated images are for visualization purposes only and should not be the sole basis for purchasing decisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Privacy and Data</Text>
          <Text style={styles.paragraph}>
            Your use of the App is also governed by our Privacy Policy. By using TryOn, you consent to our collection and use of your data as described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Fees and Payments</Text>
          <Text style={styles.paragraph}>
            TryOn is currently free to use. We reserve the right to introduce paid features or subscriptions in the future. If we do:
          </Text>
          <Text style={styles.bulletPoint}>• We will provide advance notice</Text>
          <Text style={styles.bulletPoint}>• Existing features may remain free or become paid</Text>
          <Text style={styles.bulletPoint}>• Refund policies will be clearly stated</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Disclaimers and Limitations</Text>

          <Text style={styles.subTitle}>10.1 Service "As Is"</Text>
          <Text style={styles.paragraph}>
            The App is provided "as is" without warranties of any kind. We do not guarantee:
          </Text>
          <Text style={styles.bulletPoint}>• Uninterrupted or error-free service</Text>
          <Text style={styles.bulletPoint}>• Accuracy of AI-generated results</Text>
          <Text style={styles.bulletPoint}>• Compatibility with all devices</Text>
          <Text style={styles.bulletPoint}>• Data backup or recovery</Text>

          <Text style={styles.subTitle}>10.2 Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, TryOn shall not be liable for:
          </Text>
          <Text style={styles.bulletPoint}>• Indirect, incidental, or consequential damages</Text>
          <Text style={styles.bulletPoint}>• Loss of data, profits, or business opportunities</Text>
          <Text style={styles.bulletPoint}>• Damages arising from use or inability to use the App</Text>
          <Text style={styles.bulletPoint}>• Third-party actions or content</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Termination</Text>

          <Text style={styles.subTitle}>11.1 By You</Text>
          <Text style={styles.paragraph}>
            You may terminate your account at any time by deleting it through the App settings.
          </Text>

          <Text style={styles.subTitle}>11.2 By Us</Text>
          <Text style={styles.paragraph}>
            We may suspend or terminate your account if you:
          </Text>
          <Text style={styles.bulletPoint}>• Violate these Terms</Text>
          <Text style={styles.bulletPoint}>• Engage in fraudulent or illegal activity</Text>
          <Text style={styles.bulletPoint}>• Upload prohibited content</Text>
          <Text style={styles.bulletPoint}>• Abuse or misuse the service</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. We will notify you of material changes by:
          </Text>
          <Text style={styles.bulletPoint}>• Posting updated Terms in the App</Text>
          <Text style={styles.bulletPoint}>• Sending email notifications</Text>
          <Text style={styles.bulletPoint}>• Displaying in-app notices</Text>
          <Text style={styles.paragraph}>
            Continued use of the App after changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration or in courts of competent jurisdiction.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms, contact us:
          </Text>
          <Text style={styles.bulletPoint}>• Email: legal@tryon.app</Text>
          <Text style={styles.bulletPoint}>• Support: support@tryon.app</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
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

