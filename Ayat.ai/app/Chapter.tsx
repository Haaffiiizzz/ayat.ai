import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, StyleSheet, FlatList } from "react-native";
import Surahs from "@/utils/FullDataset.json";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// export const unstable_settings = {
//   tabBarStyle: { display: 'none' },
//   drawerItemStyle: { display: 'none' },
// };


export default function Chapter() {

  const { surahStr, verse } = useLocalSearchParams();
  const surahID = Number(surahStr) - 1;
  
  const surahData = Surahs[surahID];
  const targetVerseIndex = verse
  ? surahData.verses.findIndex(
      (v) => v.id === Number(verse)
    )
  : null;
  if (!surahData)
    return <Text style={styles.fallback}>Chapter not found.</Text>;

  console.log(
  "verse param:",
  verse,
  "first items:",
  surahData.verses.slice(0, 5)
);
  const [fontsLoaded] = useFonts({
    Uthmanic: require("../assets/fonts/UthmanTN_v2-0.ttf"),
  });

  
  const flatListRef = useRef(null);

  // -----------------------------
  // Save scroll position (INDEX)
  // -----------------------------
  const storeScrollIndex = async (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    // approximate height per verse box
    const ITEM_HEIGHT = 120;

    const index = Math.floor(offsetY / ITEM_HEIGHT);

    await AsyncStorage.setItem(
      "LastReadVerseIndex",
      index.toString()
    );

  };

  // -----------------------------
  // Restore scroll position
  // -----------------------------
  const scrollToIndex = (index) => {
    if (index === null || index < 0) return;

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }, 500);
  };


  useEffect(() => {
    const run = async () => {
      const lastSurahViewed = await AsyncStorage.getItem("LastSurahViewed");

      const sameSurah =
        Number(lastSurahViewed) === Number(surahID + 1);

      // CASE 1: If we came from index
      if (targetVerseIndex !== null) {
        console.log("did this")
        scrollToIndex(targetVerseIndex);
      }

      // CASE 2: If we came from last surah
      else if (sameSurah) {
        const savedIndex = await AsyncStorage.getItem("LastReadVerseIndex");

        if (savedIndex) {
          scrollToIndex(Number(savedIndex));
        }
        await AsyncStorage.setItem(
        "LastSurahViewed",
        (surahID + 1).toString()
      );
      }
      
      await AsyncStorage.setItem("LastSurahViewed", surahStr)
      // always update current surah
      
    };

    run();
  }, [surahID, targetVerseIndex]);

  // -----------------------------
  // Render verse
  // -----------------------------
  const renderItem = ({ item }) => {
    return (
      <View style={styles.verseBox}>
        <View style={styles.arabicRow}>
          <Text style={styles.verseArabic}>{item.text}</Text>
          <View style={styles.ayahBadge}>
            <Text style={styles.ayahBadgeText}>{item.id}</Text>
          </View>
        </View>
        <Text style={styles.verseTranslation}>
          {item.translation}
        </Text>
      </View>
    );
  };

  // -----------------------------
  // Fix scrollToIndex edge cases
  // -----------------------------
  const handleScrollToIndexFailed = (info) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 500);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={surahData.verses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}

      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}

      onScroll={storeScrollIndex}
      scrollEventThrottle={100}

      onScrollToIndexFailed={handleScrollToIndexFailed}

      // IMPORTANT: helps FlatList know positions
      getItemLayout={(data, index) => ({
        length: 120,
        offset: 120 * index,
        index,
      })}

      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.name}>{surahData.name}</Text>
          <Text style={styles.transliteration}>
            {surahData.transliteration}
          </Text>
          <Text style={styles.translation}>
            {surahData.translation}
          </Text>
          <Text style={styles.meta}>
            {surahData.type.toUpperCase()} •{" "}
            {surahData.total_verses} Verses
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },

  // Header Section
  header: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  transliteration: {
    fontSize: 18,
    color: "#1f2937",
    marginTop: 6,
    fontWeight: "600",
  },
  translation: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  meta: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },

  // Verse Section
  verseBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  arabicRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  verseArabic: {
    flex: 1,
    fontSize: 28,
    lineHeight: 45,
    textAlign: "right",
    writingDirection: "rtl",
    color: "#111827",
    fontFamily: "Uthmanic",
  },
  ayahBadge: {
    minWidth: 28,
    height: 28,
    marginLeft: 8,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  ayahBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  verseTranslation: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },

  fallback: {
    flex: 1,
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
    fontSize: 16,
  },
});
