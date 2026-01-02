import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors, useIsDarkMode } from "../../src/theme/colors";

const API_URL = "https://api.tryonapp.in";

type GeneratedImage = {
  id: string;
  result_url: string;
  created_at: string;
  generation_time_ms: number;
};

type UserCredits = {
  available_tryons: number;
};

export default function HomeScreen() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [credits, setCredits] = useState<UserCredits>({
    available_tryons: 0,
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch generated images (limit to 5 for recent)
      const imagesResponse = await fetch(`${API_URL}/tryon/images?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setGeneratedImages(imagesData.images || []);
      }

      // Fetch wardrobe count
      const wardrobeResponse = await fetch(`${API_URL}/wardrobe`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (wardrobeResponse.ok) {
        const wardrobeData = await wardrobeResponse.json();
        setWardrobeCount(wardrobeData.length || 0);
      }

      // Fetch user credits
      const creditsResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (creditsResponse.ok) {
        const userData = await creditsResponse.json();
        setCredits({
          available_tryons: userData.user.available_tryons || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>TryOn</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}
            onPress={() => router.push("/profile")}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Card - Try On */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.heroCard]}
            onPress={() => router.push("/camera")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isDark ? ["#1a1a2e", "#16213e", "#0f0f23"] : ["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroIconContainer}>
                  <Ionicons name="sparkles" size={28} color="#fff" />
                </View>
                <Text style={styles.heroTitle}>Start Try-On</Text>
                <Text style={styles.heroSubtitle}>See yourself in any outfit instantly</Text>
              </View>
              <View style={styles.heroArrow}>
                <Ionicons name="arrow-forward-circle" size={48} color="rgba(255,255,255,0.9)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Credits Card */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: isDark ? "rgba(212, 175, 55, 0.12)" : "rgba(212, 175, 55, 0.15)", borderColor: colors.accentBorder }]}
            onPress={() => router.push("/pricing")}
            activeOpacity={0.8}
          >
            <View style={styles.statIconBg}>
              <Ionicons name="diamond" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.accent }]}>{credits.available_tryons}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Credits</Text>
          </TouchableOpacity>

          {/* Wardrobe Card */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={() => router.push("/wardrobe")}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBg, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }]}>
              <Ionicons name="shirt-outline" size={20} color={colors.textPrimary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{wardrobeCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wardrobe</Text>
          </TouchableOpacity>

          {/* Gallery Card */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={() => router.push("/images")}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBg, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }]}>
              <Ionicons name="images-outline" size={20} color={colors.textPrimary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{generatedImages.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gallery</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => router.push("/wardrobe")}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={28} color={colors.textPrimary} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>Add Clothes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => router.push("/pricing")}
              activeOpacity={0.8}
            >
              <Ionicons name="flash-outline" size={28} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>Get Credits</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Generations Section */}
        {generatedImages.length > 0 && (
          <Animated.View
            style={[
              styles.recentSection,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent</Text>
              <TouchableOpacity onPress={() => router.push("/images")}>
                <Text style={[styles.seeAll, { color: colors.accent }]}>See All →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {generatedImages.map((image) => (
                <TouchableOpacity
                  key={image.id}
                  style={[styles.recentCard, { borderColor: colors.cardBorder }]}
                  activeOpacity={0.9}
                  onPress={() => router.push("/images")}
                >
                  <Image
                    source={{ uri: image.result_url }}
                    style={styles.recentImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && (
          <Animated.View
            style={[
              styles.emptyState,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={[styles.emptyIconBg, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
              <Ionicons name="sparkles-outline" size={40} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Ready to transform?</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Take a photo and try on any outfit
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push("/camera")}
            >
              <Text style={styles.emptyButtonText}>Start Now</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileButton: {
    borderRadius: 24,
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  heroGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    minHeight: 140,
  },
  heroContent: {
    flex: 1,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  heroArrow: {
    marginLeft: 16,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recentCard: {
    width: 140,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  recentImage: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    marginTop: 32,
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
