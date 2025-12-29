import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { COLORS } from "../../src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import SelectClothesModal from "../../src/components/SelectClothesModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import WardrobeSelectModal from "@/src/components/WardrobeSelectModal";
import ProcessingScreen from "../../src/components/ProcessingScreen";
import ResultScreen from "../../src/components/ResultScreen";
import { Image } from "react-native";




export default function CameraScreen() {
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

  
  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textPrimary, marginBottom: 12 }}>
          Camera access is required
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#4da6ff" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.9,
    });
    setPhotoUri(photo.uri);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

        <View style={styles.topRightControls}>
          {/* Home */}
          <TouchableOpacity
            style={styles.topIcon}
            onPress={() => router.replace("/")}
          >
            <Ionicons name="home-outline" size={22} color="#fff" />
          </TouchableOpacity>

        </View>
      {/* MAIN CONTENT BASED ON FLOW STATE */}
        {flowState === "CAPTURE" && (
          <>
            {/* Camera preview */}
            {!photoUri ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
              />
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
                    onPress={takePhoto}
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
                  <View style={styles.afterCapture}>
                    {/* Select Clothes */}
                    <TouchableOpacity
                      style={styles.glassButton}
                      onPress={() => setShowSelectModal(true)}
                    >
                      <Text style={styles.selectText}>Select Clothes</Text>
                    </TouchableOpacity>
                    {/* Retry */}
                    <TouchableOpacity
                      style={styles.glassIcon}
                      onPress={() => setPhotoUri(null)}
                    >
                      <Ionicons
                        name="refresh"
                        size={22}
                        color={COLORS.textPrimary}
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

        onSelectLink={(url) => {
        setShowSelectModal(false);
        setFlowState("PROCESSING");

        setTimeout(() => {
          setGeneratedImages([
            "https://picsum.photos/600/900?random=921",
            "https://picsum.photos/600/900?random=922",
          ]);
          setFlowState("RESULT");
        }, 3000);

        console.log("Product link:", url);
      }}

      />

      <WardrobeSelectModal
        visible={showWardrobeModal}
        onClose={() => setShowWardrobeModal(false)}
        onGenerate={(selection) => {
          setShowWardrobeModal(false);
          setFlowState("PROCESSING");

          // TEMP: simulate AI generation
          setTimeout(() => {
            setGeneratedImages([
              "https://picsum.photos/600/900?random=901", // front
              "https://picsum.photos/600/900?random=902", // back
            ]);
            setFlowState("RESULT");
          }, 3000);
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1.5,
    borderColor: "rgba(180,120,255,0.6)",
  },

  // controls: {
  //   position: "absolute",
  //   bottom: 50,
  //   width: "100%",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  // captureOuter: {
  //   width: 76,
  //   height: 76,
  //   borderRadius: 38,
  //   borderWidth: 4,
  //   borderColor: "#fff",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  // captureInner: {
  //   width: 58,
  //   height: 58,
  //   borderRadius: 29,
  //   backgroundColor: "#fff",
  // },

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
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
  },

  glassIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  glassButton: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },


  selectBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  selectText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
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

});
