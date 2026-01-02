import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useIsDarkMode } from "../theme/colors";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";


type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectWardrobe: () => void;
  onSelectLink: (url: string) => void;
};

export default function SelectClothesModal({
  visible,
  onClose,
  onSelectWardrobe,
  onSelectLink,
}: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [link, setLink] = useState("");

  function handleContinue() {
    if (!link.trim()) return;
    onSelectLink(link.trim());
    setLink("");
    setShowLinkInput(false);
  }

  async function handlePaste() {
    const text = await Clipboard.getStringAsync();
    if (!text) return;
    setLink(text);
    }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.sheet, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Select Clothes</Text>

          {/* Wardrobe */}
          {!showLinkInput && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.option, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}
                onPress={onSelectWardrobe}
              >
                <Ionicons
                  name="shirt-outline"
                  size={22}
                  color={colors.textPrimary}
                />
                <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                  Choose from Wardrobe
                </Text>
              </TouchableOpacity>

              {/* Paste Link */}
              <TouchableOpacity
                style={[styles.option, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}
                onPress={() => setShowLinkInput(true)}
              >
                <Ionicons
                  name="link-outline"
                  size={22}
                  color={colors.textPrimary}
                />
                <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                  Paste Product Link
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showLinkInput && (
            <View style={styles.linkBox}>
                {/* Read-only link preview */}
                <View style={[styles.readOnlyInput, { backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.06)" }]}>
                    <Text
                        style={[
                        styles.readOnlyText,
                        { color: colors.textPrimary },
                        !link && { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                    >
                        {link || "Paste product image link"}
                    </Text>

                    <TouchableOpacity
                        style={[styles.pasteIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }]}
                        onPress={handlePaste}
                    >
                        <Ionicons
                        name="clipboard-outline"
                        size={18}
                        color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                    </View>

                    <View style={styles.linkActions}>
                        {/* Back */}
                        <TouchableOpacity
                            onPress={() => {
                            setShowLinkInput(false);
                            setLink("");
                            }}
                        >
                            <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
                        </TouchableOpacity>

                        {/* Continue */}
                        <TouchableOpacity
                            style={[
                            styles.continueBtn,
                            { backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)" },
                            !link && { opacity: 0.5 },
                            ]}
                            disabled={!link}
                            onPress={handleContinue}
                        >
                            <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={colors.textPrimary}
                            />
                            <Text style={[styles.continueText, { color: colors.textPrimary }]}>Continue</Text>
                        </TouchableOpacity>
                        </View>

            </View>
            )}


          {/* Cancel */}
          {!showLinkInput && (
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    padding: 22,
    paddingBottom: 30,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
  },

  optionsContainer: {
    marginBottom: 10,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 12,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "600",
  },

  cancel: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
  linkBox: {
    marginTop: 6,
    marginBottom: 20,
  },

  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  cancelInline: {
    fontSize: 14,
  },

  pasteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
  },

  pasteText: {
    fontSize: 14,
    fontWeight: "600",
  },

  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
  },

  continueText: {
    fontSize: 14,
    fontWeight: "600",
  },

  readOnlyInput: {
    height: 48,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  readOnlyText: {
    flex: 1,
    fontSize: 14,
  },

  pasteIcon: {
    position: "absolute",
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  linkActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  backText: {
    fontSize: 14,
  },

  categoryToggle: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },

  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  categoryTabActive: {
  },

  categoryTabText: {
    fontSize: 13,
    fontWeight: "600",
  },

  categoryTabTextActive: {
  },
});

