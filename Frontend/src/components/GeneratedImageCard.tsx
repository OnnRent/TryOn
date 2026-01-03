import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

type Props = {
  uri: string;
  onPress: () => void;
  onDelete?: () => void;
};

export default function GeneratedImageCard({ uri, onPress, onDelete }: Props) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Subtle border overlay for depth */}
      <View
        style={[styles.borderOverlay, { borderColor: colors.glassBorder }]}
      />

      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
});
