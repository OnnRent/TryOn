import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

type Props = {
  label: string;
  imageUri?: string | null;
  onPress: () => void;
};

export default function UploadImageCard({ label, imageUri, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <>
          <Ionicons
            name="camera-outline"
            size={28}
            color={COLORS.textSecondary}
          />
          <Text style={styles.text}>{label}</Text>
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
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
    color: COLORS.textSecondary,
  },
});
