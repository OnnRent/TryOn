import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { COLORS } from "../theme/colors";

export default function HomeNavbar() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TryOn</Text>

      <TouchableOpacity>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
  },
});
