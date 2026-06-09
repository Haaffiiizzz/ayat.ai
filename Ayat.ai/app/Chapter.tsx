import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, FlatList } from "react-native";
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


  const [fontsLoaded] = useFonts({
    Uthmanic: require("../assets/fonts/UthmanTN_v2-0.ttf"),
  });

  
  const flatListRef = useRef(null);

  // Save scroll position (INDEX)

  const lastReadVerseIndexKey = `LastReadVerseIndexV2-${surahID + 1}`;
  const lastReadVerseIndexKeyRef = useRef(lastReadVerseIndexKey);
  const shouldSaveLastReadRef = useRef(false);

  useEffect(() => {
    lastReadVerseIndexKeyRef.current = lastReadVerseIndexKey;
  }, [lastReadVerseIndexKey, targetVerseIndex]);

  const enableLastReadSaving = () => {
    if (targetVerseIndex !== null) return;

    setTimeout(() => {
      shouldSaveLastReadRef.current = true;
    }, 1500);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!shouldSaveLastReadRef.current) return;

    const firstVisible = viewableItems[0];

    if (!firstVisible || firstVisible.index == null) return;

    AsyncStorage.setItem(
      lastReadVerseIndexKeyRef.current,
      firstVisible.index.toString()
    );
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Restore scroll position

  const scrollToIndex = (index, viewPosition = 0) => {
    if (index === null || index < 0) return;

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: index,
        animated: true,
        viewPosition,
      });
    }, 500);
  };


  useEffect(() => {
    const run = async () => {
      shouldSaveLastReadRef.current = false;

      const lastSurahViewed = await AsyncStorage.getItem("LastSurahViewed");

      const sameSurah =
        Number(lastSurahViewed) === Number(surahID + 1);

      // CASE 1: If we came from index
      if (targetVerseIndex !== null) {
        scrollToIndex(targetVerseIndex, 0.5);
      }

      // CASE 2: If we came from last surah
      else if (sameSurah) {
        const savedIndex = await AsyncStorage.getItem(lastReadVerseIndexKey);
        if (savedIndex) {
          scrollToIndex(Number(savedIndex));
        }
        enableLastReadSaving();
        await AsyncStorage.setItem(
        "LastSurahViewed",
        (surahID + 1).toString()
      );
      }
      
      else{
        //This way we dont update if Case 1 happens
        await AsyncStorage.setItem("LastSurahViewed", surahStr)
        enableLastReadSaving();
      }
 
      
    };

    run();
  }, [surahID, targetVerseIndex, lastReadVerseIndexKey]);


  // Render verse

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


  // Fix scrollToIndex edge cases

  const handleScrollToIndexFailed = (info) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    const viewPosition = targetVerseIndex !== null ? 0.5 : 0;

    wait.then(() => {
      flatListRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition,
        });
      }, 500);
    });
  };

  return (
    <FlatList
      ref={flatListRef}
      data={surahData.verses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}

      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}

      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}

      onScrollToIndexFailed={handleScrollToIndexFailed}


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
