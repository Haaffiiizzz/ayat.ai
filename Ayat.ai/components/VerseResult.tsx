import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import Highlighted from "@/utils/highlighted";
import Verses from "@/utils/Verses.json"; 
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
type VerseDetails = {
  VerseID: string;
  SurahNumber: number;
  VerseNumber: number;
  SurahNameArabic: string;
  SurahNameTransliteration: string;
  SurahNameEnglish: string;
  VerseWithHarakat: string;
  VerseWithoutHarakat: string;
  VerseEnglish: string;
  VerseIndex: number;
};

type Props = {
  verse: VerseDetails;
  keyword?: string;
};

export default function VerseResult({ verse, keyword }: Props) {
  // Get previous and next verses by index
  const [fontsLoaded] = useFonts({
    Uthmanic: require("../assets/fonts/UthmanTN_v2-0.ttf"),
  });
  const router = useRouter();
  // Derive current index; fall back to Surah/Ayah if VerseID shapes differ
  const currIdx = React.useMemo(() => {
    const list: any[] = Verses as any;
    let idx = list.findIndex((v) => v.VerseID === verse.VerseID);
    if (idx === -1 && verse?.SurahNumber && verse?.VerseNumber) {
      idx = list.findIndex(
        (v) => v.SurahNumber === verse.SurahNumber && v.VerseNumber === verse.VerseNumber
      );
    }
    return idx;
  }, [verse?.VerseID, verse?.SurahNumber, verse?.VerseNumber]);
  const prevVerse = currIdx > 0 ? (Verses as any)[currIdx - 1] : undefined;
  const nextVerse = currIdx >= 0 && currIdx < (Verses as any).length - 1 ? (Verses as any)[currIdx + 1] : undefined;

  return (
    <View style={styles.responseCard}>
      {prevVerse && (
        <View style={[styles.verseBlock, styles.prevNextBlock]}>
          <Text style={styles.prevNextLabel}>Previous</Text>
          <Text style={styles.arabicText}>{prevVerse.VerseWithHarakat}</Text>
          <Text style={styles.responseValue}>{prevVerse.VerseEnglish}.</Text>
        </View>
      )}

      {/* Current Verse */}
      <View style={styles.currentBlock}>
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Surah</Text>
          <Text style={styles.responseValue}>{verse.SurahNumber}. {verse.SurahNameTransliteration} - {verse.SurahNameEnglish}</Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Ayah</Text>
          <Text style={styles.responseValue}>{verse.VerseNumber}</Text>
        </View>

        
        <View style={styles.divider} />
        <View style={styles.verseBlock}>
          <Text style={styles.responseLabel}>Verse</Text>
          <Text style={styles.arabicText}>{verse.VerseWithHarakat}</Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.verseBlock}>
          <Text style={styles.responseLabel}>Translation</Text>
          {keyword ? (
            <Highlighted text={verse.VerseEnglish} query={keyword} />
          ) : (
            <Text style={styles.responseValue}>{verse.VerseEnglish}.</Text>
          )}
        </View>
        <Button
          title="Go to Surah"
          onPress={() => {
            router.push(`/Chapter?surahStr=${verse.SurahNumber}`)
            }}
        />
      </View>

      {nextVerse && (
        <View style={[styles.verseBlock, styles.prevNextBlock]}>
          <Text style={styles.prevNextLabel}>Next</Text>
          <Text style={styles.arabicText}>{nextVerse.VerseWithHarakat}</Text>
          <Text style={styles.responseValue}>{nextVerse.VerseEnglish}.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  responseCard: {
    width: "90%",
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#f9f9f9",
  },

  responseRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingVertical: 6,
    width: "100%",
  },

  responseLabel: {
    width: 90,
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
    paddingTop: 2,
  },

  responseValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    flexShrink: 1,
    flexWrap: "wrap",
    marginLeft: 8,
    width: undefined,
    maxWidth: "100%",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 6,
  },

  arabicText: {
    fontSize: 26,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 38,
    marginTop: 6,
    color: "#111827",
    fontFamily: "Uthmanic"
  },

  verseBlock: {
    marginTop: 8,
  },

  currentBlock: {
    backgroundColor: "#fff8dc", // light highlight
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    width: "100%",
  },

  prevNextBlock: {
    backgroundColor: "#f0f0f0", // subtle gray for context
    borderRadius: 8,
    padding: 8,
  },

  prevNextLabel: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
});
