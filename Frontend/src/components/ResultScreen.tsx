import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useThemeColors } from "../theme/colors";
import { useState } from "react";

const { width, height } = Dimensions.get("window");

type Props = {
  images: string[]; // [front, back]
};

export default function ResultScreen({ images }: Props) {
  const colors = useThemeColors();
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>(
    images.reduce((acc, _, i) => ({ ...acc, [i]: true }), {})
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.page}>
            {loadingStates[index] && (
              <ActivityIndicator
                size="large"
                color={colors.textPrimary}
                style={styles.loader}
              />
            )}
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
              priority="high"
              onLoadStart={() => {
                setLoadingStates((prev) => ({ ...prev, [index]: true }));
              }}
              onLoad={() => {
                setLoadingStates((prev) => ({ ...prev, [index]: false }));
              }}
              onError={() => {
                setLoadingStates((prev) => ({ ...prev, [index]: false }));
              }}
            />
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  page: {
    width,
    height,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: width - 32,
    height: height * 0.75,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },

  loader: {
    position: "absolute",
    zIndex: 1,
  },
});
