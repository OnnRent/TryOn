import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { useThemeColors, useIsDarkMode } from "../../src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import SelectClothesModal from "../../src/components/SelectClothesModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import WardrobeSelectModal from "@/src/components/WardrobeSelectModal";
import ProcessingScreen from "../../src/components/ProcessingScreen";
import ResultScreen from "../../src/components/ResultScreen";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";

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




export default function CameraScreen() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const cameraRef = useRef<CameraView | null>(null);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  type CameraFlowState = "CAPTURE" | "PROCESSING" | "RESULT";
  const [flowState, setFlowState] = useState<CameraFlowState>("CAPTURE");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary, marginBottom: 12 }}>
          Camera access is required
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#4da6ff" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function startCountdown() {
    // Clear any existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Start countdown from 3
    setCountdown(3);
    let count = 3;

    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        // Countdown finished, take photo
        clearInterval(countdownTimerRef.current!);
        setCountdown(null);
        takePhotoNow();
      }
    }, 1000);
  }

  async function takePhotoNow() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.9,
    });
    setPhotoUri(photo.uri);
  }

  function cancelCountdown() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

        <View style={styles.topRightControls}>
          {/* Home */}
          <TouchableOpacity
            style={[
              styles.topIcon,
              { backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.9)" }
            ]}
            onPress={() => router.replace("/")}
          >
            <Ionicons name="home-outline" size={22} color={isDark ? "#fff" : "#1A1A1A"} />
          </TouchableOpacity>

        </View>
      {/* MAIN CONTENT BASED ON FLOW STATE */}
        {flowState === "CAPTURE" && (
          <>
            {/* Camera preview */}
            {!photoUri ? (
              <>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing={facing}
                />

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <View style={styles.countdownOverlay}>
                    <View style={styles.countdownCircle}>
                      <Text style={styles.countdownText}>{countdown}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cancelCountdownButton}
                      onPress={cancelCountdown}
                    >
                      <Text style={styles.cancelCountdownText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <Image
                source={{ uri: photoUri }}
                style={[
                  styles.camera,
                  facing === "front" && { transform: [{ scaleX: -1 }] },
                ]}
                resizeMode="cover"
              />

            )}


            {/* Controls */}
            <View style={[styles.controls, { bottom: insets.bottom + 90 }]}>
              {!photoUri ? (
                <View style={styles.captureRow}>
                  {/* Capture */}
                  <TouchableOpacity
                    onPress={startCountdown}
                    activeOpacity={0.9}
                    style={styles.captureOuter}
                  >
                    <View style={styles.captureInner} />
                  </TouchableOpacity>

                  {/* Rotate */}
                  <TouchableOpacity
                    onPress={() =>
                      setFacing((prev) =>
                        prev === "back" ? "front" : "back"
                      )
                    }
                    style={styles.rotateBtnBottom}
                  >
                    <Ionicons
                      name="camera-reverse-outline"
                      size={26}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    styles.afterCaptureWrapper,
                  ]}
                >
                  <View style={[
                    styles.afterCapture,
                    { backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.9)" }
                  ]}>
                    {/* Select Clothes */}
                    <TouchableOpacity
                      style={[
                        styles.glassButton,
                        { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" }
                      ]}
                      onPress={() => setShowSelectModal(true)}
                    >
                      <Text style={[styles.selectText, { color: isDark ? "#fff" : "#1A1A1A" }]}>Select Clothes</Text>
                    </TouchableOpacity>
                    {/* Retry */}
                    <TouchableOpacity
                      style={[
                        styles.glassIcon,
                        { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }
                      ]}
                      onPress={() => setPhotoUri(null)}
                    >
                      <Ionicons
                        name="refresh"
                        size={22}
                        color={isDark ? "#fff" : "#1A1A1A"}
                      />
                    </TouchableOpacity>


                  </View>
                </View>

              )}
            </View>
          </>
        )}

        {flowState === "PROCESSING" && <ProcessingScreen />}

        {flowState === "RESULT" && (
          <ResultScreen images={generatedImages} />
        )}

              

      {/* Step 2 Modal */}
      <SelectClothesModal
        visible={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        onSelectWardrobe={() => {
          setShowSelectModal(false);
          setShowWardrobeModal(true);
        }}

        onSelectLink={async (url) => {
          setShowSelectModal(false);
          setFlowState("PROCESSING");

          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
              Alert.alert("Error", "Please log in again");
              setFlowState("CAPTURE");
              return;
            }

            console.log("🔍 Scraping product from link:", url);

            // Use localhost for scraping (Puppeteer doesn't work on Vercel)
            const response = await fetch("https://api.tryonapp.in/scrape-product", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                product_url: url,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to scrape product");
            }

            console.log(`✅ Scraped ${data.count} images from product`);

            // Now generate virtual try-on with the scraped clothing image
            console.log("🎨 Starting virtual try-on generation...");

            // Ask user to select clothing type
            Alert.alert(
              "Select Clothing Type",
              "What type of clothing is this?",
              [
                {
                  text: "Top (Shirt/T-shirt/Jacket)",
                  onPress: async () => {
                    await generateTryOn(data.images[0].data, "top");
                  },
                },
                {
                  text: "Bottom (Pants/Jeans/Skirt)",
                  onPress: async () => {
                    await generateTryOn(data.images[0].data, "bottom");
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => setFlowState("CAPTURE"),
                },
              ]
            );

            // Helper function to poll job status with exponential backoff
            async function pollJobStatus(jobId: string, token: string): Promise<string> {
              const maxAttempts = 40; // Reduced from 60
              let pollInterval = 3000; // Start with 3 seconds
              const maxInterval = 15000; // Max 15 seconds between polls

              for (let attempt = 0; attempt < maxAttempts; attempt++) {
                console.log(`🔄 Polling attempt ${attempt + 1}/${maxAttempts}... (waiting ${pollInterval/1000}s)`);

                const statusResponse = await fetch(`https://api.tryonapp.in/tryon/status/${jobId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (!statusResponse.ok) {
                  throw new Error("Failed to check job status");
                }

                const statusData = await statusResponse.json();
                console.log(`Status: ${statusData.status}`);

                if (statusData.status === "completed") {
                  console.log("✅ Job completed!");
                  return statusData.result_url;
                }

                if (statusData.status === "failed") {
                  throw new Error(statusData.error_message || "Generation failed");
                }

                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, pollInterval));

                // Exponential backoff: increase interval after first few attempts
                // First 5 attempts: 3s, then gradually increase to 15s
                if (attempt >= 5) {
                  pollInterval = Math.min(pollInterval * 1.2, maxInterval);
                }
              }

              throw new Error("Job timed out after 10 minutes. Please try again.");
            }

            // Helper function to generate try-on
            async function generateTryOn(clothingImageData: string, clothingType: "top" | "bottom") {
              try {
                setFlowState("PROCESSING");

                if (!photoUri) {
                  throw new Error("No person photo found");
                }

                console.log(`🎨 Generating ${clothingType} try-on...`);

                // Compress person image before upload
                console.log("🗜️ Compressing person image...");
                const compressedPhotoUri = await compressImage(photoUri);

                // Prepare form data - send base64 data directly
                console.log("📦 Preparing form data...");
                const formData = new FormData();

                // Person image - compressed
                // @ts-ignore - React Native FormData accepts file URIs
                formData.append("person_image", {
                  uri: compressedPhotoUri,
                  type: "image/jpeg",
                  name: "person.jpg",
                } as any);

                // Clothing image - send as base64 string
                const base64Data = clothingImageData.split(',')[1];
                formData.append("clothing_image_base64", base64Data);
                formData.append("clothing_type", clothingType);

                console.log("✅ FormData prepared (person: file URI, clothing: base64)");
                console.log("📤 Sending to virtual try-on API...");

                const tryonResponse = await fetch("https://api.tryonapp.in/tryon/generate", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                });

                const tryonData = await tryonResponse.json();
                console.log("Response:", tryonData);

                if (!tryonResponse.ok) {
                  throw new Error(tryonData.error || "Virtual try-on failed");
                }

                console.log(`✅ Job created: ${tryonData.generated_image_id}`);
                console.log("⏳ Waiting for processing to complete...");

                // Poll for completion
                const resultUrl = await pollJobStatus(tryonData.generated_image_id, token!);

                console.log("✅ Virtual try-on completed!");

                // Show the generated result
                setGeneratedImages([resultUrl]);
                setFlowState("RESULT");

              } catch (error: any) {
                console.error("Virtual try-on error:", error);
                Alert.alert(
                  "Try-On Failed",
                  error.message || "Could not generate virtual try-on. Please try again.",
                  [
                    {
                      text: "OK",
                      onPress: () => setFlowState("CAPTURE"),
                    },
                  ]
                );
              }
            }

          } catch (error: any) {
            console.error("Scrape error:", error);
            Alert.alert(
              "Scraping Failed",
              error.message || "Could not scrape product images. Please try a different link.",
              [
                {
                  text: "OK",
                  onPress: () => setFlowState("CAPTURE"),
                },
              ]
            );
          }
        }}

      />

      <WardrobeSelectModal
        visible={showWardrobeModal}
        onClose={() => setShowWardrobeModal(false)}
        onGenerate={async (selection) => {
          setShowWardrobeModal(false);
          setFlowState("PROCESSING");

          try {
            const token = await AsyncStorage.getItem("token");
            if (!token || !photoUri) {
              Alert.alert("Error", "Missing photo or authentication");
              setFlowState("CAPTURE");
              return;
            }

            // Determine which item to use (top or bottom)
            const selectedItem = selection.top || selection.bottom;
            if (!selectedItem) {
              Alert.alert("Error", "Please select a clothing item");
              setFlowState("CAPTURE");
              return;
            }

            const clothingType = selection.top ? "top" : "bottom";

            console.log("🎨 Generating virtual try-on...", {
              itemId: selectedItem.id,
              type: clothingType,
            });

            // Fetch wardrobe item images
            const wardrobeResponse = await fetch(
              `https://api.tryonapp.in/wardrobe/${selectedItem.id}/images`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!wardrobeResponse.ok) {
              throw new Error("Failed to fetch wardrobe images");
            }

            const wardrobeData = await wardrobeResponse.json();
            const clothingImageUrl = wardrobeData.images.front || wardrobeData.images.back;

            if (!clothingImageUrl) {
              throw new Error("No clothing image found");
            }

            // Compress person image before upload
            console.log("🗜️ Compressing person image...");
            const compressedPhotoUri = await compressImage(photoUri);

            // Prepare form data with file URIs (React Native way)
            const formData = new FormData();

            // Add person image - compressed
            // @ts-ignore - React Native FormData accepts file URIs
            formData.append("person_image", {
              uri: compressedPhotoUri,
              type: "image/jpeg",
              name: "person.jpg",
            } as any);

            // Add clothing image - use S3 URL directly
            // @ts-ignore - React Native FormData accepts URLs
            formData.append("clothing_image", {
              uri: clothingImageUrl,
              type: "image/jpeg",
              name: "clothing.jpg",
            } as any);

            formData.append("wardrobe_item_id", selectedItem.id);
            formData.append("clothing_type", clothingType);

            console.log("📦 FormData prepared with URIs:", {
              personUri: compressedPhotoUri,
              clothingUri: clothingImageUrl,
            });

            console.log("📤 Sending to virtual try-on API...");

            // Call virtual try-on API
            const tryonResponse = await fetch("https://api.tryonapp.in/tryon/generate", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });

            const tryonData = await tryonResponse.json();

            if (!tryonResponse.ok) {
              throw new Error(tryonData.message || "Virtual try-on failed");
            }

            console.log(`✅ Job created: ${tryonData.generated_image_id}`);
            console.log("⏳ Waiting for processing to complete...");

            // Helper function to poll job status with exponential backoff
            async function pollJobStatus(jobId: string, token: string): Promise<string> {
              const maxAttempts = 40; // Reduced from 60
              let pollInterval = 3000; // Start with 3 seconds
              const maxInterval = 15000; // Max 15 seconds between polls

              for (let attempt = 0; attempt < maxAttempts; attempt++) {
                console.log(`🔄 Polling attempt ${attempt + 1}/${maxAttempts}... (waiting ${pollInterval/1000}s)`);

                const statusResponse = await fetch(`https://api.tryonapp.in/tryon/status/${jobId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (!statusResponse.ok) {
                  throw new Error("Failed to check job status");
                }

                const statusData = await statusResponse.json();
                console.log(`Status: ${statusData.status}`);

                if (statusData.status === "completed") {
                  console.log("✅ Job completed!");
                  return statusData.result_url;
                }

                if (statusData.status === "failed") {
                  throw new Error(statusData.error_message || "Generation failed");
                }

                await new Promise(resolve => setTimeout(resolve, pollInterval));

                // Exponential backoff: increase interval after first few attempts
                if (attempt >= 5) {
                  pollInterval = Math.min(pollInterval * 1.2, maxInterval);
                }
              }

              throw new Error("Job timed out after 10 minutes. Please try again.");
            }

            // Poll for completion
            const resultUrl = await pollJobStatus(tryonData.generated_image_id, token);

            console.log("✅ Virtual try-on completed!");

            // Show result
            setGeneratedImages([resultUrl]);
            setFlowState("RESULT");

          } catch (error: any) {
            console.error("Virtual try-on error:", error);
            Alert.alert(
              "Try-On Failed",
              error.message || "Could not generate virtual try-on. Please try again.",
              [
                {
                  text: "OK",
                  onPress: () => setFlowState("CAPTURE"),
                },
              ]
            );
          }
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  previewContainer: {
    flex: 1,
  },

  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  topRightControls: {
    position: "absolute",
    top: 80,
    left: 30,
    flexDirection: "row",
    gap: 12,
    zIndex: 20,
  },

  topIcon: {
    width: 60,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(180,120,255,0.6)",
  },

  afterCaptureWrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },

  afterCapture: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
  },

  glassIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  glassButton: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },


  selectBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  selectText: {
    fontSize: 15,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
  position: "absolute",
  width: "100%",
  alignItems: "center",
},

captureRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 26,
},

rotateBtnBottom: {
  width: 52,
  height: 52,
  borderRadius: 26,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.45)",
},

captureOuter: {
  width: 78,
  height: 78,
  borderRadius: 39,
  borderWidth: 4,
  borderColor: "#fff",
  alignItems: "center",
  justifyContent: "center",
},

captureInner: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#fff",
},

// Countdown styles
countdownOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.7)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
},

countdownCircle: {
  width: 150,
  height: 150,
  borderRadius: 75,
  backgroundColor: "rgba(255,255,255,0.15)",
  borderWidth: 4,
  borderColor: "#fff",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 30,
},

countdownText: {
  fontSize: 72,
  fontWeight: "bold",
  color: "#fff",
},

cancelCountdownButton: {
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 24,
  backgroundColor: "rgba(255,255,255,0.2)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.3)",
},

cancelCountdownText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
},

});
