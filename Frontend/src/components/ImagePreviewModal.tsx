import {
  Modal,
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useIsDarkMode } from "../theme/colors";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  images: string[];
  onClose: () => void;
};

export default function ImagePreviewModal({
  visible,
  images,
  onClose,
}: Props) {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Header */}
        <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </BlurView>

        {/* Image Pager */}
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={images}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Image source={{ uri: item }} style={styles.image} />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },

  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },

  page: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: width - 40,
    height: width * 1.4,
    borderRadius: 24,
    resizeMode: "contain",
  },
});
