import { Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/colors";

type Props = {
  label: string;
  imageUri?: string | null;
  onPress: () => void;
};

export default function UploadImageCard({ label, imageUri, onPress }: Props) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <>
          <Ionicons
            name="camera-outline"
            size={28}
            color={colors.textSecondary}
          />
          <Text style={[styles.text, { color: colors.textSecondary }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 120,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  text: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
});
