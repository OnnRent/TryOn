import { Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

export default function ImagesNavbar() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={[styles.container, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Generated Images</Text>
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
    alignItems: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
