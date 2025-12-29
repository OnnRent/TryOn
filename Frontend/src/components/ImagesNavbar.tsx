import { Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { COLORS } from "../theme/colors";

export default function ImagesNavbar() {
  return (
    <BlurView intensity={20} tint="dark" style={styles.container}>
      <Text style={styles.title}>Generated Images</Text>
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
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
});
