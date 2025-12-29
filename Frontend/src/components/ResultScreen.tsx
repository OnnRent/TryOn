import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { COLORS } from "../theme/colors";

const { width, height } = Dimensions.get("window");

type Props = {
  images: string[]; // [front, back]
};

export default function ResultScreen({ images }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="contain"
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
    backgroundColor: COLORS.background,
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
  },
});
