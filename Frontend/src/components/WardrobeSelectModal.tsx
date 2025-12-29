import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { COLORS } from "../theme/colors";
import { router } from "expo-router";


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

const MOCK_TOPS: Item[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `top-${i}`,
  uri: `https://picsum.photos/400/600?random=${i + 500}`,
}));

const MOCK_BOTTOMS: Item[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `bottom-${i}`,
  uri: `https://picsum.photos/400/600?random=${i + 600}`,
}));

export default function WardrobeSelectModal({
  visible,
  onClose,
  onGenerate,
}: Props) {
  const [category, setCategory] = useState<"top" | "bottom">("top");
  const [selectedTop, setSelectedTop] = useState<Item | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<Item | null>(null);

  const data = category === "top" ? MOCK_TOPS : MOCK_BOTTOMS;

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
        <BlurView intensity={40} tint="dark" style={styles.sheet}>
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
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <Text style={styles.title}>Select Clothes</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={26}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={styles.toggle}>
            {["top", "bottom"].map((v) => {
              const active = category === v;
              return (
                <TouchableOpacity
                  key={v}
                  style={[styles.toggleTab, active && styles.toggleActive]}
                  onPress={() => setCategory(v as any)}
                >
                  <Text
                    style={{
                      color: active
                        ? COLORS.textPrimary
                        : COLORS.textSecondary,
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
                    style={[
                        styles.card,
                        isSelected && styles.selectedCard,
                    ]}
                    onPress={() => onSelect(item)}
                    activeOpacity={0.85}
                    >
                    <View style={styles.imagePlaceholder} />
                    </TouchableOpacity>
                );
                }}

          />

          {/* Generate */}
          {canGenerate && (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={() =>
                onGenerate({
                  top: selectedTop || undefined,
                  bottom: selectedBottom || undefined,
                })
              }
            >
              <Text style={styles.generateText}>
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
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
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
    color: COLORS.textPrimary,
  },

  toggle: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  toggleActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 18,
    backgroundColor: "#222",
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: "#7CFFB2",
  },

  disabledCard: {
    opacity: 0.25,
  },

  imagePlaceholder: {
    flex: 1,
  },

  generateBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  generateText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
