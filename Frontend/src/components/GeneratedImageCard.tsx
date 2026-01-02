import {
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

type Props = {
  uri: string;
  onPress: () => void;
};

export default function GeneratedImageCard({ uri, onPress }: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

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

      {/* Subtle glass overlay */}
      <BlurView
        intensity={12}
        tint={isDark ? "dark" : "light"}
        style={[styles.glass, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
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
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
  },
});
