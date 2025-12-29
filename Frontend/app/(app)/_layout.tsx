// app/(app)/_layout.tsx
import { Slot, usePathname, router } from "expo-router";
import { View } from "react-native";
import GlassTabBar from "../../src/components/GlassTabBar";
import { COLORS } from "../../src/theme/colors";

export default function AppLayout() {
  const pathname = usePathname();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Slot />
      {pathname !== "/camera" && (
        <GlassTabBar
          activePath={pathname}
          onNavigate={(path) => router.push(path)}
        />
      )}
    </View>
  );
}
