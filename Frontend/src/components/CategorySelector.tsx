import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

type Props = {
  value: "top" | "bottom";
  onChange: (v: "top" | "bottom") => void;
};

export default function CategorySelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {["top", "bottom"].map((item) => {
        const active = value === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item as any)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text
              style={[
                styles.text,
                { color: active ? COLORS.textPrimary : COLORS.textSecondary },
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
