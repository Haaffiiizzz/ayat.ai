import React, {useEffect, useState, useCallback} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Surahs from "@/utils/Surahs.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Quran() {
  const router = useRouter();

  const storeLastSurah = async (index: Number) => {
    await AsyncStorage.setItem("LastSurahViewed", (Number(index)).toString());
  }

  const [lastSurah, setLastSurah] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadLastSurah = async () => {
        const temp = await AsyncStorage.getItem("LastSurahViewed");
        if (isActive) setLastSurah(temp);
      };

      loadLastSurah();

      return () => {
        isActive = false;
      };
    }, [])
  );

  let lastSurahName;
  if (lastSurah) {
    lastSurahName = Surahs[Number(lastSurah) - 1]["SurahNameTransliteration"]
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={[styles.surahCard, {alignContent : "center"}]} 
        onPress={async () => {
          
          if (lastSurah){
            router.push(`/Chapter?surahStr=${lastSurah}`)
          }
        }}>
          <Text>Continue Reading Surah {lastSurah ? lastSurahName: " "}... </Text>
      </TouchableOpacity>

      {Surahs.map((surah, idx) => (
        <TouchableOpacity 
            key={idx} 
            style={styles.surahCard} 
            onPress={() => {
              storeLastSurah(idx+1)
              router.push(`/Chapter?surahStr=${idx + 1}`)
            }
          }
        >
          <Text style={styles.surahNumber}>{surah.SurahInfo.split(".")[0]}</Text>
          <View style={styles.surahInfo}>
            <Text style={styles.surahNameArabic}>{surah.SurahNameArabic}</Text>
            <Text style={styles.surahTransliteration}>{surah.SurahNameTransliteration}</Text>
            <Text style={styles.surahNameEnglish}>{surah.SurahNameEnglish}</Text>
        </View>

        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  surahNumber: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 12,
    color: "#111827",
  },
  surahInfo: {
  flexDirection: "column",
  flex: 1,
  alignItems: "flex-end",
},
  surahNameArabic: {
    fontSize: 18,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
    color: "#111827",
  },
  surahNameEnglish: {
    fontSize: 14,
    color: "#6b7280",
  },

  surahTransliteration: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
    marginVertical: 2,
    textAlign: "right",
}

});
