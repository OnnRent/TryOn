import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { COLORS } from "../theme/colors";

export default function ProcessingScreen() {
  return (
    <View style={styles.container}>
      {/* Big AI Animation */}
      <LottieView
        source={require("../../assets/lottie/ai-processing.json")}
        autoPlay
        loop
        speed={0.9}
        style={styles.lottie}
      />

      {/* Primary Message */}
      <Text style={styles.title}>
        Crafting your perfect look
      </Text>

      {/* Secondary Message */}
      <Text style={styles.subtitle}>
        Our AI is analyzing fit, fabric, and style
      </Text>

      {/* Tertiary / reassurance */}
      <Text style={styles.hint}>
        This usually takes just a few seconds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  lottie: {
    width: 320,   // 🔥 MUCH BIGGER
    height: 320,
    marginBottom: 32,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  hint: {
    marginTop: 18,
    fontSize: 13,
    color: COLORS.textSecondary,
    opacity: 0.7,
    textAlign: "center",
  },
});
