import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

export default function WardrobeNavbar({ onAdd }: { onAdd: () => void }) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.container, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Wardrobe</Text>

      <TouchableOpacity onPress={onAdd}>
        <Ionicons name="add" size={26} color={colors.textPrimary} />
      </TouchableOpacity>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
