import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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
          <Text style={[styles.appName, { color: colors.textPrimary }]}>TryOn</Text>
          <TouchableOpacity
            style={[styles.profileButton, { borderColor: colors.cardBorder }]}
            onPress={() => router.push("/profile")}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Credits Badge */}
        <Animated.View
          style={[
            styles.creditsBadgeContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.creditsBadge, { backgroundColor: colors.accentBackground, borderColor: colors.accentBorder }]}
            onPress={() => router.push("/pricing")}
            activeOpacity={0.8}
          >
            <View style={[styles.creditsIconContainer, { backgroundColor: colors.accentBackground }]}>
              <Ionicons name="diamond" size={24} color={colors.accent} />
            </View>
            <View style={styles.creditsInfo}>
              <Text style={[styles.creditsLabel, { color: colors.textSecondary }]}>Available Try-Ons</Text>
              <Text style={[styles.creditsCount, { color: colors.accent }]}>{credits.available_tryons}</Text>
            </View>
            <Ionicons name="add-circle" size={28} color={colors.accent} />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions - Bento Grid */}
        <Animated.View
          style={[
            styles.bentoGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Large Card - Try On */}
          <TouchableOpacity
            style={[styles.bentoCard, styles.bentoLarge, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={() => router.push("/camera")}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Ionicons name="camera" size={32} color={colors.textPrimary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Virtual Try-On</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>See yourself in new outfits</Text>
            </View>
            <View style={[styles.cardGlow, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }]} />
          </TouchableOpacity>

          {/* Small Cards Row */}
          <View style={styles.bentoRow}>
            <TouchableOpacity
              style={[styles.bentoCard, styles.bentoSmall, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => router.push("/wardrobe")}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Ionicons name="shirt" size={24} color={colors.textPrimary} />
              </View>
              <Text style={[styles.cardTitleSmall, { color: colors.textPrimary }]}>Wardrobe</Text>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{wardrobeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bentoCard, styles.bentoSmall, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => router.push("/images")}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Ionicons name="images" size={24} color={colors.textPrimary} />
              </View>
              <Text style={[styles.cardTitleSmall, { color: colors.textPrimary }]}>Gallery</Text>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{generatedImages.length}</Text>
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
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Generations</Text>
              <TouchableOpacity onPress={() => router.push("/images")}>
                <Text style={[styles.seeAll, { color: colors.textSecondary }]}>See All</Text>
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
                  style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  activeOpacity={0.8}
                  onPress={() => router.push("/images")}
                >
                  <Image
                    source={{ uri: image.result_url }}
                    style={styles.recentImage}
                    contentFit="cover"
                  />
                  <View style={styles.recentOverlay}>
                    <Ionicons name="eye" size={32} color="rgba(255,255,255,0.9)" />
                  </View>
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
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <Ionicons name="images-outline" size={64} color={colors.cardBorder} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Generations Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start creating virtual try-ons to see them here
            </Text>
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  creditsBadgeContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  creditsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  creditsInfo: {
    flex: 1,
  },
  creditsLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  creditsCount: {
    fontSize: 24,
    fontWeight: "700",
  },
  appName: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  profileButton: {
    borderRadius: 50,
    borderWidth: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  bentoGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  bentoCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  bentoLarge: {
    height: 200,
    padding: 24,
    justifyContent: "space-between",
  },
  bentoRow: {
    flexDirection: "row",
    gap: 16,
  },
  bentoSmall: {
    flex: 1,
    height: 160,
    padding: 20,
    justifyContent: "space-between",
  },
  cardContent: {
    zIndex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardTitleSmall: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
  },
  cardGlow: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  recentSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentCard: {
    width: 160,
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  recentImage: {
    width: "100%",
    height: "100%",
  },
  recentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    marginTop: 60,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
