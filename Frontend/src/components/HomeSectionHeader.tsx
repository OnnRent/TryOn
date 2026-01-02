import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  onPress: () => void;
};

export default function HomeSectionHeader({ title, onPress }: Props) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
