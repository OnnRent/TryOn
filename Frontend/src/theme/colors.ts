import { useColorScheme } from "react-native";

// Dark theme colors (current)
const darkColors = {
  background: "#000000",
  surface: "#1E1E1E",
  glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.18)",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  cardBackground: "rgba(30, 30, 30, 0.8)",
  cardBorder: "rgba(255,255,255,0.1)",
  accent: "#D4AF37",
  accentBackground: "rgba(212, 175, 55, 0.1)",
  accentBorder: "rgba(212, 175, 55, 0.3)",
};

// Light theme colors
const lightColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  glass: "rgba(255,255,255,0.85)",
  glassBorder: "rgba(0,0,0,0.12)",
  textPrimary: "#1A1A1A",
  textSecondary: "#555555",
  cardBackground: "rgba(255, 255, 255, 0.95)",
  cardBorder: "rgba(0,0,0,0.08)",
  accent: "#D4AF37",
  accentBackground: "rgba(212, 175, 55, 0.15)",
  accentBorder: "rgba(212, 175, 55, 0.4)",
};

export type ThemeColors = typeof darkColors;

// Legacy export for backward compatibility
export const COLORS = darkColors;

// Hook to get theme-aware colors
export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === "light" ? lightColors : darkColors;
}

// Hook to check if using dark mode
export function useIsDarkMode(): boolean {
  const colorScheme = useColorScheme();
  return colorScheme !== "light";
}
