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
import { COLORS } from "../theme/colors";
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
        <BlurView intensity={40} tint="dark" style={styles.sheet}>
          <Text style={styles.title}>Select Clothes</Text>

          {/* Wardrobe */}
          {!showLinkInput && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.option}
                onPress={onSelectWardrobe}
              >
                <Ionicons
                  name="shirt-outline"
                  size={22}
                  color={COLORS.textPrimary}
                />
                <Text style={styles.optionText}>
                  Choose from Wardrobe
                </Text>
              </TouchableOpacity>

              {/* Paste Link */}
              <TouchableOpacity
                style={styles.option}
                onPress={() => setShowLinkInput(true)}
              >
                <Ionicons
                  name="link-outline"
                  size={22}
                  color={COLORS.textPrimary}
                />
                <Text style={styles.optionText}>
                  Paste Product Link
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showLinkInput && (
            <View style={styles.linkBox}>
                {/* Read-only link preview */}
                <View style={styles.readOnlyInput}>
                    <Text
                        style={[
                        styles.readOnlyText,
                        !link && { color: COLORS.textSecondary },
                        ]}
                        numberOfLines={1}
                    >
                        {link || "Paste product image link"}
                    </Text>

                    <TouchableOpacity
                        style={styles.pasteIcon}
                        onPress={handlePaste}
                    >
                        <Ionicons
                        name="clipboard-outline"
                        size={18}
                        color={COLORS.textPrimary}
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
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>

                        {/* Continue */}
                        <TouchableOpacity
                            style={[
                            styles.continueBtn,
                            !link && { opacity: 0.5 },
                            ]}
                            disabled={!link}
                            onPress={handleContinue}
                        >
                            <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={COLORS.textPrimary}
                            />
                            <Text style={styles.continueText}>Continue</Text>
                        </TouchableOpacity>
                        </View>

            </View>
            )}


          {/* Cancel */}
          {!showLinkInput && (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
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
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
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
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  cancel: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkBox: {
    marginTop: 6,
    marginBottom: 20,
    },

    input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    color: COLORS.textPrimary,
    marginBottom: 14,
    },

    cancelInline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    },

        pasteBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.12)",
        },

        pasteText: {
        color: COLORS.textPrimary,
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
    backgroundColor: "rgba(255,255,255,0.18)",
    },

    continueText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    },

    readOnlyInput: {
  height: 48,
  borderRadius: 14,
  paddingLeft: 14,
  paddingRight: 44, // 👈 space for icon
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "rgba(0,0,0,0.35)",
  marginBottom: 14,
},

readOnlyText: {
  flex: 1,
  fontSize: 14,
  color: COLORS.textPrimary,
},

pasteIcon: {
  position: "absolute",
  right: 10,
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.12)",
},

linkActions: {
  flexDirection: "row",
  justifyContent: "space-between", // 👈 key
  alignItems: "center",
  marginTop: 6,
},

backText: {
  color: COLORS.textSecondary,
  fontSize: 14,
},

categoryToggle: {
  flexDirection: "row",
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 14,
  backgroundColor: "rgba(255,255,255,0.05)",
},

categoryTab: {
  flex: 1,
  paddingVertical: 10,
  alignItems: "center",
},

categoryTabActive: {
  backgroundColor: "rgba(255,255,255,0.12)",
},

categoryTabText: {
  fontSize: 13,
  fontWeight: "600",
  color: COLORS.textSecondary,
},

categoryTabTextActive: {
  color: COLORS.textPrimary,
},

});

