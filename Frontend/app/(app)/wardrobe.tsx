import { View, FlatList, ActivityIndicator, Text, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { COLORS } from "../../src/theme/colors";
import WardrobeNavbar from "../../src/components/WardrobeNavbar";
import WardrobeToggle from "../../src/components/WardrobeToggle";
import WardrobeItemCard from "../../src/components/WardrobeItemCard";
import UploadWardrobeModal from "../../src/components/UploadWardrobeModal";
import ImagePreviewModal from "../../src/components/ImagePreviewModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WardrobeItem = {
  id: string;
  category: "top" | "bottom";
  created_at: string;
  images: {
    front?: string;
    back?: string;
  };
};

export default function WardrobeScreen() {
  const [active, setActive] = useState<"top" | "bottom">("top");
  const [showModal, setShowModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wardrobe items
  async function fetchWardrobeItems() {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(
        `https://try-on-xi.vercel.app/wardrobe?category=${active}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wardrobe items");
      }

      const data = await response.json();
      console.log("Data:", data);
      console.log(`📦 Loaded ${data.length} ${active} items`);
      setWardrobeItems(data);
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Load items on mount and when category changes
  useEffect(() => {
    setLoading(true);
    fetchWardrobeItems();
  }, [active]);

  // Refresh after upload
  function handleModalClose() {
    setShowModal(false);
    fetchWardrobeItems(); // Refresh the list
  }

  // Pull to refresh
  function handleRefresh() {
    setRefreshing(true);
    fetchWardrobeItems();
  }

  // Delete item
  async function handleDelete(itemId: string) {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this wardrobe item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                console.error("No auth token found");
                return;
              }

              const response = await fetch(
                `https://try-on-xi.vercel.app/wardrobe/${itemId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error("Failed to delete item");
              }

              console.log("✅ Item deleted successfully");

              // Remove from local state immediately for smooth UX
              setWardrobeItems((prev) => prev.filter((item) => item.id !== itemId));

              // Optionally refresh from server
              // fetchWardrobeItems();
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete item. Please try again.");
            }
          },
        },
      ]
    );
  }

  // Filter items by active category
  const filteredItems = wardrobeItems.filter(
    (item) => item.category === active
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <WardrobeNavbar onAdd={() => setShowModal(true)} />

      <WardrobeToggle active={active} onChange={setActive} />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.textPrimary} />
          <Text style={styles.loadingText}>Loading wardrobe...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No {active} items yet</Text>
          <Text style={styles.emptySubtext}>
            Tap + to add your first item
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 14, paddingBottom: 140 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => {
            // Use front image as thumbnail, fallback to back if front doesn't exist
            const thumbnailUri = item.images.front || item.images.back || "";

            if (!thumbnailUri) {
              return null; // Skip items without images
            }

            return (
              <WardrobeItemCard
                uri={thumbnailUri}
                onPress={() => {
                  // Show both front and back in preview
                  const images = [];
                  if (item.images.front) images.push(item.images.front);
                  if (item.images.back) images.push(item.images.back);
                  setPreviewImages(images);
                  setPreviewOpen(true);
                }}
                onDelete={() => handleDelete(item.id)}
              />
            );
          }}
        />
      )}

      <ImagePreviewModal
        visible={previewOpen}
        images={previewImages}
        onClose={() => setPreviewOpen(false)}
      />
      <UploadWardrobeModal
        visible={showModal}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
