import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { COLORS } from "../src/theme/colors";
import ImagesNavbar from "../src/components/ImagesNavbar";
import GeneratedImageCard from "../src/components/GeneratedImageCard";
import ImagePreviewModal from "../src/components/ImagePreviewModal";

type GeneratedImage = {
  front: string;
  back: string;
};

const MOCK_GENERATED: GeneratedImage[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    front: `https://picsum.photos/400/600?random=${i + 200}`,
    back: `https://picsum.photos/400/600?random=${i + 300}`,
  })
);

export default function ImagesScreen() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  return (
    <SafeAreaView style={styles.container}>
      <ImagesNavbar />

      <FlatList
        data={MOCK_GENERATED}
        numColumns={2}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.column}>
            <GeneratedImageCard
              uri={item.front}
              onPress={() => {
                setPreviewImages([item.front, item.back]);
                setPreviewOpen(true);
              }}
            />
          </View>
        )}
      />

      <ImagePreviewModal
        visible={previewOpen}
        images={previewImages}
        onClose={() => setPreviewOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  row: {
    gap: 14,
    paddingHorizontal: 20,
  },

  column: {
    flex: 1,
  },

  listContent: {
    gap: 14,
    paddingBottom: 140, // space for bottom nav
  },
};
