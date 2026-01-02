import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useIsDarkMode } from "../../src/theme/colors";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserData = {
  id: string;
  email: string;
  created_at: string;
  wardrobe_count: number;
};

export default function ProfileScreen() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const { logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch("https://api.tryonapp.in/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/signin");
        },
      },
    ]);
  };

  const handleSupport = () => {
    router.push("/support");
  };

  const handlePrivacyPolicy = () => {
    router.push("/privacy");
  };

  const handleTermsOfService = () => {
    router.push("/terms");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account Details</Text>

          <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
            <View style={styles.cardItem}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Email</Text>
              <Text style={[styles.cardValue, { color: colors.textSecondary }]}>{userData?.email || "Not available"}</Text>
            </View>
          </BlurView>

          <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
            <View style={styles.cardItem}>
              <Ionicons name="shirt-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Wardrobe Items</Text>
              <Text style={[styles.cardValue, { color: colors.textSecondary }]}>{userData?.wardrobe_count || 0}</Text>
            </View>
          </BlurView>

          <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
            <View style={styles.cardItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Member Since</Text>
              <Text style={[styles.cardValue, { color: colors.textSecondary }]}>
                {userData?.created_at
                  ? new Date(userData.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : "Unknown"}
              </Text>
            </View>
          </BlurView>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subscription</Text>

          <TouchableOpacity onPress={() => router.push("/pricing")} activeOpacity={0.7}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
              <View style={styles.cardItem}>
                <Ionicons name="diamond-outline" size={20} color="#FFC107" />
                <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Pricing Plans</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Support</Text>

          <TouchableOpacity onPress={handleSupport} activeOpacity={0.7}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
              <View style={styles.cardItem}>
                <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Legal</Text>

          <TouchableOpacity onPress={handlePrivacyPolicy} activeOpacity={0.7}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
              <View style={styles.cardItem}>
                <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleTermsOfService} activeOpacity={0.7}>
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.card, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
              <View style={styles.cardItem}>
                <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
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
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 16,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

