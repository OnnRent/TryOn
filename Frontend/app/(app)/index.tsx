import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { router } from "expo-router";
import { COLORS } from "../../src/theme/colors";
import { useAuth } from "../../src/context/AuthContext";

import HomeNavbar from "../../src/components/HomeNavbar";
import HomeSectionHeader from "../../src/components/HomeSectionHeader";
import ImageCarousel from "../../src/components/ImageCarousel";

const MOCK_IMAGES = Array.from({ length: 7 }).map(
  (_, i) => `https://picsum.photos/400/600?random=${i}`
);

export default function HomeScreen() {
  // const { user } = useAuth();

  // // 🔐 AUTH GUARD
  // useEffect(() => {
  //   if (!user) {
  //     router.replace("/signin");
  //   }
  // }, [user]);

  // ⛔ Prevent UI flicker
  // if (!user) {
  //   return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  // }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        paddingBottom: 120, // space for glass tab bar
      }}
    >
      {/* Top Navbar */}
      <HomeNavbar />

      {/* Generated Photos */}
      <HomeSectionHeader
        title="Generated Photos"
        onPress={() => router.push("/images")}
      />
      <ImageCarousel data={MOCK_IMAGES} />

      {/* Wardrobe */}
      <HomeSectionHeader
        title="Wardrobe"
        onPress={() => router.push("/wardrobe")}
      />
      <ImageCarousel data={MOCK_IMAGES} />
    </SafeAreaView>
  );
}
