import { FlatList, Image, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  data: string[];
};

export default function ImageCarousel({ data }: Props) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      keyExtractor={(_, i) => i.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item }} style={styles.image} />

          {/* subtle glass overlay */}
          <BlurView intensity={12} tint="dark"  />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    width: 150,
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#1a1a1a",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
