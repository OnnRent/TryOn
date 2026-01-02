import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

type Props = {
  value: "top" | "bottom";
  onChange: (v: "top" | "bottom") => void;
};

export default function CategorySelector({ value, onChange }: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      {["top", "bottom"].map((item) => {
        const active = value === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item as any)}
            style={[
              styles.tab,
              active && {
                backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
              }
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: active ? colors.textPrimary : colors.textSecondary },
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
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
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
