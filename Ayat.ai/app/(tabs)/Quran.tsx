import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Surahs from "@/utils/Surahs.json";

export default function Quran() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      {Surahs.map((surah, idx) => (
        <TouchableOpacity 
          key={idx} 
          style={styles.surahCard} 
          onPress={() => router.push(`/Chapter?surahStr=${idx + 1}`)}
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
