import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useThemeColors, useIsDarkMode } from "../theme/colors";
import { router } from "expo-router";
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

type Item = {
  id: string;
  uri: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onGenerate: (selection: {
    top?: Item;
    bottom?: Item;
  }) => void;
};

export default function WardrobeSelectModal({
  visible,
  onClose,
  onGenerate,
}: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [category, setCategory] = useState<"top" | "bottom">("top");
  const [selectedTop, setSelectedTop] = useState<Item | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<Item | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wardrobe items when modal opens or category changes
  useEffect(() => {
    if (visible) {
      fetchWardrobeItems();
    }
  }, [visible, category]);

  async function fetchWardrobeItems() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(
        `https://api.tryonapp.in/wardrobe?category=${category}`,
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
      console.log(`📦 Loaded ${data.length} ${category} items for selection`);
      setWardrobeItems(data);
    } catch (error) {
      console.error("Error fetching wardrobe:", error);
    } finally {
      setLoading(false);
    }
  }

  // Convert wardrobe items to selectable items
  const data: Item[] = wardrobeItems
    .filter((item) => item.images.front || item.images.back)
    .map((item) => ({
      id: item.id,
      uri: item.images.front || item.images.back || "",
    }));

  const canGenerate = selectedTop || selectedBottom;

  function onSelect(item: Item) {
    if (category === "top") {
        setSelectedTop((prev) =>
        prev?.id === item.id ? null : item
        );
    } else {
        setSelectedBottom((prev) =>
        prev?.id === item.id ? null : item
        );
    }
    }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.sheet, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
                onPress={() => {
                    onClose();
                    router.push("/wardrobe");
                }}
                >
              <Ionicons
                name="add"
                size={26}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.textPrimary }]}>Select Clothes</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={26}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={[styles.toggle, { backgroundColor: colors.glass }]}>
            {["top", "bottom"].map((v) => {
              const active = category === v;
              return (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.toggleTab,
                    active && {
                      backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                    }
                  ]}
                  onPress={() => setCategory(v as any)}
                >
                  <Text
                    style={{
                      color: active
                        ? colors.textPrimary
                        : colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    {v.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.textPrimary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading {category}s...</Text>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="shirt-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No {category}s yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Add items to your wardrobe first
              </Text>
            </View>
          ) : (
            <FlatList
              data={data}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={{ gap: 14 }}
              contentContainerStyle={{ gap: 14, paddingBottom: 100 }}
              renderItem={({ item }) => {
                const isSelected =
                  (category === "top" && selectedTop?.id === item.id) ||
                  (category === "bottom" && selectedBottom?.id === item.id);

                return (
                  <TouchableOpacity
                    style={[styles.card, { backgroundColor: isDark ? "#222" : "#f0f0f0" }, isSelected && styles.selectedCard]}
                    onPress={() => onSelect(item)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.uri }} style={styles.image} />
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons
                          name="checkmark-circle"
                          size={28}
                          color="#4CAF50"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Generate */}
          {canGenerate && (
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)" }]}
              onPress={() =>
                onGenerate({
                  top: selectedTop || undefined,
                  bottom: selectedBottom || undefined,
                })
              }
            >
              <Text style={[styles.generateText, { color: colors.textPrimary }]}>
                Generate Image
              </Text>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  sheet: {
    height: "90%",
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  toggle: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },

  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  toggleActive: {
  },

  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },

  selectedCard: {
    borderWidth: 3,
    borderColor: "#4CAF50",
  },

  disabledCard: {
    opacity: 0.25,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 14,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
  },

  generateBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  generateText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
