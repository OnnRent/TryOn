import { View, FlatList, ActivityIndicator, Text, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useThemeColors } from "../../src/theme/colors";
import ImagesNavbar from "../../src/components/ImagesNavbar";
import GeneratedImageCard from "../../src/components/GeneratedImageCard";
import ImagePreviewModal from "../../src/components/ImagePreviewModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

type GeneratedImage = {
  id: string;
  result_url: string;
  person_url: string;
  clothing_url: string;
  created_at: string;
  generation_time_ms: number;
};

export default function ImagesScreen() {
  const colors = useThemeColors();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch generated images from backend
  const fetchGeneratedImages = async () => {
    try {
      console.log("🔄 Fetching generated images...");
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found");
        setLoading(false);
        return;
      }

      console.log("📡 Making API request to /tryon/images");
      const response = await fetch("https://api.tryonapp.in/tryon/images?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error("Failed to fetch generated images");
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.images.length} generated images`);
      console.log("📸 First image:", data.images[0]);
      setGeneratedImages(data.images);
    } catch (error) {
      console.error("❌ Error fetching generated images:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load images on mount
  useEffect(() => {
    fetchGeneratedImages();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchGeneratedImages();
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ImagesNavbar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your try-ons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state
  if (generatedImages.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ImagesNavbar />
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Try-Ons Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start creating virtual try-ons to see them here!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ImagesNavbar />

      <FlatList
        data={generatedImages}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.column}>
            <GeneratedImageCard
              uri={item.result_url}
              onPress={() => {
                // Show result, person, and clothing images
                setPreviewImages([item.result_url, item.person_url, item.clothing_url]);
                setPreviewOpen(true);
              }}
            />
          </View>
        )}
      />

      <ImagePreviewModal
        visible={previewOpen}
        images={previewImages}
        onClose={() => setPreviewOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  row: {
    gap: 14,
    paddingHorizontal: 20,
  },
  column: {
    flex: 1,
  },
  listContent: {
    gap: 14,
    paddingBottom: 140,
  },
});
