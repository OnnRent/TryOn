import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

export default function GlassTabButton({ icon, active, onPress }: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.wrapper}
    >
      {active ? (
        <View style={[
          styles.activeBubble,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)",
            borderColor: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.12)",
          }
        ]}>
          <Ionicons name={icon} size={22} color={colors.textPrimary} />
        </View>
      ) : (
        <Ionicons name={icon} size={22} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 70,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  activeBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
