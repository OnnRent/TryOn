import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { useState, useEffect } from "react";
import { useThemeColors, useIsDarkMode } from "../theme/colors";
import CategorySelector from "./CategorySelector";
import UploadImageCard from "./UploadImageCard";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  requestCameraPermission,
  requestGalleryPermission,
} from "../utils/permissions";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// Compress image to reduce file size before upload
async function compressImage(uri: string): Promise<string> {
  try {
    console.log(`🗜️ Compressing image: ${uri.substring(0, 50)}...`);
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize to max 1200px width
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    console.log(`✅ Compressed image: ${result.uri.substring(0, 50)}...`);
    return result.uri;
  } catch (error) {
    console.error("⚠️ Image compression failed:", error);
    return uri; // Return original if compression fails
  }
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

const MAX_WARDROBE_ITEMS = 15;

export default function UploadWardrobeModal({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const [category, setCategory] = useState<"top" | "bottom">("top");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const canUpload = frontImage && backImage && !uploading && totalItems < MAX_WARDROBE_ITEMS;

  // Fetch total wardrobe count when modal opens
  useEffect(() => {
    if (visible) {
      fetchTotalWardrobeCount();
    }
  }, [visible]);

  async function getAuthToken() {
    return AsyncStorage.getItem("token");
  }

  // Fetch total wardrobe item count
  async function fetchTotalWardrobeCount() {
    try {
      setLoadingCount(true);
      const token = await getAuthToken();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(
        "https://api.tryonapp.in/wardrobe",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wardrobe items");
      }

      const data = await response.json();
      setTotalItems(data.length);
      console.log(`📊 Total wardrobe items: ${data.length}/${MAX_WARDROBE_ITEMS}`);
    } catch (error) {
      console.error("Error fetching wardrobe count:", error);
    } finally {
      setLoadingCount(false);
    }
  }

  // STEP 1: Create wardrobe item
  async function createWardrobeItem() {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token found. Please sign in again.");
    }

    console.log("🔑 Token exists:", !!token);

    const res = await fetch("https://api.tryonapp.in/wardrobe/item", {
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

    // Compress images before upload to reduce file size
    console.log("🗜️ Compressing images before upload...");
    const compressedFront = await compressImage(frontImage);
    const compressedBack = await compressImage(backImage);

    // Create FormData - React Native specific format
    const formData = new FormData();

    // Append compressed images - always use JPEG after compression
    formData.append('front', {
      uri: compressedFront,
      name: 'front.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('back', {
      uri: compressedBack,
      name: 'back.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('wardrobe_item_id', wardrobeItemId);

    console.log("📤 Uploading images...");
    console.log("Wardrobe Item ID:", wardrobeItemId);
    console.log("Front (compressed):", compressedFront.substring(0, 50));
    console.log("Back (compressed):", compressedBack.substring(0, 50));


    const res = await fetch("https://api.tryonapp.in/wardrobe/image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let fetch set it automatically with boundary
      },
      body: formData,
    });

    console.log("📥 Response status:", res.status);

    // Safely parse response - handle non-JSON responses (common on Android timeouts)
    const responseText = await res.text();
    console.log("📥 Response text:", responseText?.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", responseText?.substring(0, 100));
      throw new Error(`Server error: ${responseText?.substring(0, 100) || 'Unknown error'}`);
    }

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
    // Check if limit is reached
    if (totalItems >= MAX_WARDROBE_ITEMS) {
      Alert.alert(
        "Wardrobe Full",
        `You've reached the maximum limit of ${MAX_WARDROBE_ITEMS} wardrobe items. Please delete some items before uploading new ones.`,
        [{ text: "OK" }]
      );
      return;
    }









    Alert.alert("Select Image", "Choose image source", [
        {
        text: "Camera",
        onPress: async () => {
            const granted = await requestCameraPermission();
            if (!granted) return;

            const result = await ImagePicker.launchCameraAsync({
              quality: 0.7,
              allowsEditing: true,
              aspect: [3, 4],
              exif: false, // Don't include EXIF data to reduce size
            });

            if (!result.canceled) {
              const uri = result.assets[0].uri;
              console.log("📸 Camera image size:", result.assets[0].fileSize ? `${(result.assets[0].fileSize / 1024 / 1024).toFixed(2)} MB` : "unknown");
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
              quality: 0.7,
              allowsEditing: true,
              aspect: [3, 4],
              exif: false, // Don't include EXIF data to reduce size
            });

            if (!result.canceled) {
              const uri = result.assets[0].uri;
              console.log("🖼️ Gallery image size:", result.assets[0].fileSize ? `${(result.assets[0].fileSize / 1024 / 1024).toFixed(2)} MB` : "unknown");
              type === "front" ? setFrontImage(uri) : setBackImage(uri);
            }
        },
        },
        { text: "Cancel", style: "cancel" },
    ]);
    }


  const isLimitReached = totalItems >= MAX_WARDROBE_ITEMS;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={[styles.sheet, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Add to Wardrobe</Text>

          {/* Wardrobe Count & Limit Warning */}
          {loadingCount ? (
            <View style={[styles.countContainer, { backgroundColor: colors.glass }]}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
              <Text style={[styles.countText, { color: colors.textSecondary }]}>Loading...</Text>
            </View>
          ) : (
            <View style={[
              styles.countContainer,
              { backgroundColor: colors.glass },
              isLimitReached && styles.limitReachedContainer
            ]}>
              {isLimitReached && (
                <Ionicons name="warning" size={16} color="#ff6b6b" />
              )}
              <Text style={[
                styles.countText,
                { color: colors.textSecondary },
                isLimitReached && styles.limitReachedText
              ]}>
                {totalItems}/{MAX_WARDROBE_ITEMS} items
              </Text>
            </View>
          )}

          {/* Limit Reached Warning */}
          {isLimitReached && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Wardrobe full! Delete some items to upload new ones.
              </Text>
            </View>
          )}

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
              <ActivityIndicator size="small" color={colors.textPrimary} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>{uploadStatus}</Text>
            </View>
          )}

          {/* Upload button */}
          <TouchableOpacity
            disabled={!canUpload}
            onPress={handleUpload}
            style={[
              styles.uploadBtn,
              { backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)" },
              !canUpload && { opacity: 0.4 },
            ]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Text style={[styles.uploadText, { color: colors.textPrimary }]}>Upload</Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} disabled={uploading}>
            <Text style={[styles.cancel, { color: colors.textSecondary }, uploading && { opacity: 0.4 }]}>
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
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: "center",
  },
  limitReachedContainer: {
    backgroundColor: "rgba(255,107,107,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
  },
  countText: {
    fontSize: 13,
    fontWeight: "600",
  },
  limitReachedText: {
    color: "#ff6b6b",
  },
  warningBox: {
    backgroundColor: "rgba(255,107,107,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.25)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ff6b6b",
    textAlign: "center",
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
  },
  uploadBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "700",
  },
  cancel: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 14,
  },
});