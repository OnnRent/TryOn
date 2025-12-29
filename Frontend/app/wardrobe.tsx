import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { COLORS } from "../src/theme/colors";
import WardrobeNavbar from "../src/components/WardrobeNavbar";
import WardrobeToggle from "../src/components/WardrobeToggle";
import WardrobeItemCard from "../src/components/WardrobeItemCard";
import UploadWardrobeModal from "../src/components/UploadWardrobeModal";
import ImagePreviewModal from "../src/components/ImagePreviewModal";

const MOCK_IMAGES = Array.from({ length: 12 }).map(
  (_, i) => `https://picsum.photos/400/600?random=${i + 20}`
);

export default function WardrobeScreen() {
  const [active, setActive] = useState<"top" | "bottom">("top");
  const [showModal, setShowModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <WardrobeNavbar onAdd={() => setShowModal(true)} />

      <WardrobeToggle active={active} onChange={setActive} />

      <FlatList
        data={MOCK_IMAGES}
        numColumns={2}
        keyExtractor={(_, i) => i.toString()}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 14, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <WardrobeItemCard
            uri={item}
            onPress={() => {
                setPreviewImages([
                item,
                `${item}?back`, 
                ]);
                setPreviewOpen(true);
            }}
            />

        )}
      />
      <ImagePreviewModal
        visible={previewOpen}
        images={previewImages}
        onClose={() => setPreviewOpen(false)}
        />
      <UploadWardrobeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        />

    </SafeAreaView>
  );
}
