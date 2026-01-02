import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

type Props = {
  active: "top" | "bottom";
  onChange: (v: "top" | "bottom") => void;
};

export default function WardrobeToggle({ active, onChange }: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      {["top", "bottom"].map((item) => {
        const isActive = active === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item as any)}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
              }
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: isActive ? colors.textPrimary : colors.textSecondary },
              ]}
            >
              {item.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
