import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function UploadWardrobeModal({ visible, onClose }: Props) {
  const [category, setCategory] = useState<"top" | "bottom">("top");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const canUpload = frontImage && backImage && !uploading;

  async function getAuthToken() {
    return AsyncStorage.getItem("token");
  }

  // STEP 1: Create wardrobe item
  async function createWardrobeItem() {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token found. Please sign in again.");
    }

    console.log("🔑 Token exists:", !!token);

    const res = await fetch("https://try-on-xi.vercel.app/wardrobe/item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create wardrobe item");
    }

    return data.wardrobe_item_id;
  }

  // STEP 2: Upload images
  async function uploadImages(wardrobeItemId: string) {
    if (!frontImage || !backImage) {
      throw new Error("Both front and back images are required");
    }

    const token = await getAuthToken();

    // Create FormData - React Native specific format
    const formData = new FormData();

    // Get file info for front image
    const frontFilename = frontImage.split('/').pop() || 'front.jpg';
    const frontMatch = /\.(\w+)$/.exec(frontFilename);
    const frontType = frontMatch ? `image/${frontMatch[1]}` : 'image/jpeg';

    // Get file info for back image
    const backFilename = backImage.split('/').pop() || 'back.jpg';
    const backMatch = /\.(\w+)$/.exec(backFilename);
    const backType = backMatch ? `image/${backMatch[1]}` : 'image/jpeg';

    // Append images - React Native FormData format
    formData.append('front', {
      uri: frontImage,
      name: frontFilename,
      type: frontType,
    } as any);

    formData.append('back', {
      uri: backImage,
      name: backFilename,
      type: backType,
    } as any);

    formData.append('wardrobe_item_id', wardrobeItemId);

    console.log("📤 Uploading images...");
    console.log("Wardrobe Item ID:", wardrobeItemId);
    console.log("Front:", frontFilename, frontType);
    console.log("Back:", backFilename, backType);

    const res = await fetch("https://try-on-xi.vercel.app/wardrobe/image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it automatically with boundary
      },
      body: formData,
    });

    const data = await res.json();
    console.log("📥 Response status:", res.status);
    console.log("📥 Response data:", data);

    if (!res.ok) {
      console.error("❌ Upload failed:", data);
      throw new Error(data.error || "Failed to upload images");
    }

    return data;
  }

  // Main upload handler
  async function handleUpload() {
    if (!canUpload) return;

    setUploading(true);
    setUploadStatus("Creating wardrobe item...");

    try {
      // Step 1: Create wardrobe item
      const wardrobeItemId = await createWardrobeItem();
      console.log("✅ Created wardrobe item:", wardrobeItemId);

      // Step 2: Upload images
      setUploadStatus("Uploading images...");
      await uploadImages(wardrobeItemId);
      console.log("✅ Images uploaded successfully");

      // Success
      Alert.alert(
        "Success",
        "Your wardrobe item has been uploaded successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setFrontImage(null);
              setBackImage(null);
              setCategory("top");
              setUploadStatus("");
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload wardrobe item. Please try again.",
        [{ text: "OK" }]
      );
      setUploadStatus("");
    } finally {
      setUploading(false);
    }
  }


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

          {/* Upload Status */}
          {uploading && uploadStatus && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
              <Text style={styles.statusText}>{uploadStatus}</Text>
            </View>
          )}

          {/* Upload button */}
          <TouchableOpacity
            disabled={!canUpload}
            onPress={handleUpload}
            style={[
              styles.uploadBtn,
              !canUpload && { opacity: 0.4 },
            ]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.uploadText}>Upload</Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} disabled={uploading}>
            <Text style={[styles.cancel, uploading && { opacity: 0.4 }]}>
              Cancel
            </Text>
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
