import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

type Props = {
  active: "top" | "bottom";
  onChange: (v: "top" | "bottom") => void;
};

export default function WardrobeToggle({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      {["top", "bottom"].map((item) => {
        const isActive = active === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item as any)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text
              style={[
                styles.text,
                { color: isActive ? COLORS.textPrimary : COLORS.textSecondary },
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
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
