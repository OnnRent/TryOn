import {
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  uri: string;
  onPress: () => void;
};

export default function GeneratedImageCard({ uri, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Subtle glass overlay */}
      <BlurView
        intensity={12}
        tint="dark"
        style={styles.glass}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },

    elevation: 8, // Android safety
  },

  image: {
    width: "100%",
    height: "100%",
  },

  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
