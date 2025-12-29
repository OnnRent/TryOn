import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { COLORS } from "../theme/colors";
import CategorySelector from "./CategorySelector";
import UploadImageCard from "./UploadImageCard";
import * as ImagePicker from "expo-image-picker";
import {
  requestCameraPermission,
  requestGalleryPermission,
} from "../utils/permissions";
import { Alert } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function UploadWardrobeModal({ visible, onClose }: Props) {
  const [category, setCategory] = useState<"top" | "bottom">("top");
  const [front, setFront] = useState(false);
  const [back, setBack] = useState(false);
const [frontImage, setFrontImage] = useState<string | null>(null);
const [backImage, setBackImage] = useState<string | null>(null);

  const canUpload = frontImage && backImage;


  async function pickImage(type: "front" | "back") {
    Alert.alert("Select Image", "Choose image source", [
        {
        text: "Camera",
        onPress: async () => {
            const granted = await requestCameraPermission();
            if (!granted) return;

            const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
            });

            if (!result.canceled) {
            const uri = result.assets[0].uri;
            type === "front" ? setFrontImage(uri) : setBackImage(uri);
            }
        },
        },
        {
        text: "Gallery",
        onPress: async () => {
            const granted = await requestGalleryPermission();
            if (!granted) return;

            const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: true,
            });

            if (!result.canceled) {
            const uri = result.assets[0].uri;
            type === "front" ? setFrontImage(uri) : setBackImage(uri);
            }
        },
        },
        { text: "Cancel", style: "cancel" },
    ]);
    }


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={styles.sheet}>
          <Text style={styles.title}>Add to Wardrobe</Text>

          {/* Category */}
          <CategorySelector value={category} onChange={setCategory} />

          {/* Upload cards */}
          <View style={styles.row}>
            <UploadImageCard
                label="Front Image"
                imageUri={frontImage}
                onPress={() => pickImage("front")}
            />
            <UploadImageCard
                label="Back Image"
                imageUri={backImage}
                onPress={() => pickImage("back")}
            />
            </View>

          {/* Upload button */}
          <TouchableOpacity
            disabled={!canUpload}
            style={[
              styles.uploadBtn,
              !canUpload && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
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
    padding: 20,
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
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    marginVertical: 20,
  },
  uploadBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cancel: {
    marginTop: 14,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
