import { View, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import GlassTabButton from "./GlassTabButton";

type Props = {
  activePath: string;
  onNavigate: (path: string) => void;
};

export default function GlassTabBar({ activePath, onNavigate }: Props) {
  return (
    <View style={styles.container}>
      {/* OUTER BORDER WRAPPER */}
      <View style={styles.pillBorder}>
        {/* BLUR INSIDE */}
        <BlurView intensity={45} tint="dark" style={styles.pillBlur}>
          <GlassTabButton
            icon="home-outline"
            active={activePath === "/"}
            onPress={() => onNavigate("/")}
          />
          <GlassTabButton
            icon="shirt-outline"
            active={activePath === "/wardrobe"}
            onPress={() => onNavigate("/wardrobe")}
          />
          <GlassTabButton
            icon="image-outline"
            active={activePath === "/images"}
            onPress={() => onNavigate("/images")}
          />
        </BlurView>
      </View>

      {/* CAMERA BUTTON */}
      <View style={styles.cameraBorder}>
        <BlurView intensity={55} tint="dark" style={styles.cameraBlur}>
          <TouchableOpacity onPress={() => onNavigate("/camera")}>
            <Ionicons
              name="camera-outline"
              size={26}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
  },

  /* ===== MAIN PILL ===== */

  pillBorder: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden", // 🔥 THIS IS CRITICAL
  },

  pillBlur: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  /* ===== CAMERA ===== */

  cameraBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(180,120,255,0.6)",
    overflow: "hidden", // 🔥 REQUIRED
  },

  cameraBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
