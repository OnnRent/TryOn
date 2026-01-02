import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { useThemeColors } from "../theme/colors";

export default function ProcessingScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Big AI Animation */}
      <LottieView
        source={require("../../assets/lottie/ai-processing.json")}
        autoPlay
        loop
        speed={0.9}
        style={styles.lottie}
      />

      {/* Primary Message */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Crafting your perfect look
      </Text>

      {/* Secondary Message */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Our AI is analyzing fit, fabric, and style
      </Text>

      {/* Tertiary / reassurance */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        This usually takes around 30-45 seconds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  lottie: {
    width: 320,
    height: 320,
    marginBottom: 32,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  hint: {
    marginTop: 18,
    fontSize: 13,
    opacity: 0.7,
    textAlign: "center",
  },
});
