import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors } from "../theme/colors";

type Props = {
  uri: string;
  onPress: () => void;
};

export default function GeneratedImageCard({ uri, onPress }: Props) {
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
});
