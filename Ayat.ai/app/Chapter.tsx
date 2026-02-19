import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Surahs from "@/utils/FullDataset.json";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// export const unstable_settings = {
//   tabBarStyle: { display: 'none' },
//   drawerItemStyle: { display: 'none' },
// };


export default function Chapter() {
  const { surahStr } = useLocalSearchParams();
  const surahID = Number(surahStr)-1;
  const surahData = Surahs[surahID];    
  if (!surahData)
    return <Text style={styles.fallback}>Chapter not found.</Text>;

  const [fontsLoaded] = useFonts({
  Uthmanic: require("../assets/fonts/UthmanTN_v2-0.ttf"),
  });

  const scrollViewRef = useRef(null); // references our scrollview 


  const scrollToSavedPosition = async () => {
    // retrieve y coords of where user last scrolled and last surah viewed
    const LastSurahY = await AsyncStorage.getItem("LastSurahScrollPositionY")
    if (LastSurahY){
      // small delay so content settles before restoring position
      await new Promise((resolve) => setTimeout(resolve, 750));
      scrollViewRef.current?.scrollTo({y: Number(LastSurahY), animated: true})
    }
  }

  useEffect(() => {
    const restoreAndStoreLastSurah = async () => {
      
      const LastSurahViewed = await AsyncStorage.getItem("LastSurahViewed");
      if (Number(LastSurahViewed) == surahID + 1){
        scrollToSavedPosition();
      }

      // store only after entering the chapter 
      await AsyncStorage.setItem("LastSurahViewed", (surahID + 1).toString());
    }

    restoreAndStoreLastSurah();
  }, [surahID])

  
  const storeScroll = async (event) => {
    //stores the y coordinate whenever a scroll happens. 
    //called from onscroll in ScrollView
    const currentScrollY = event.nativeEvent.contentOffset.y;
    await AsyncStorage.setItem("LastSurahScrollPositionY", currentScrollY.toString());
    console.log(currentScrollY.toString())
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
      onScroll={storeScroll}
      scrollEventThrottle={100}
      ref={scrollViewRef}
    >

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{surahData.name}</Text>
        <Text style={styles.transliteration}>{surahData.transliteration}</Text>
        <Text style={styles.translation}>{surahData.translation}</Text>
        <Text style={styles.meta}>
          {surahData.type.toUpperCase()} • {surahData.total_verses} Verses
        </Text>
      </View>

      {/* Verses */}
      {surahData.verses.map((verse) => (
        <View key={verse.id} style={styles.verseBox}>
          <View style={styles.arabicRow}>
            <Text style={styles.verseArabic}>{verse.text}</Text>
            <View style={styles.ayahBadge}>
              <Text style={styles.ayahBadgeText}>{verse.id}</Text>
            </View>
          </View>
          <Text style={styles.verseTranslation}>{verse.translation}</Text>
        </View>
      ))}
    </ScrollView>
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
