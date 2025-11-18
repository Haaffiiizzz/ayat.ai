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

  const [fontsLoaded] = useFonts({
    Uthmanic: require("../assets/fonts/UthmanTN_v2-0.ttf"),
  });
  const router = useRouter();
  const verseList = React.useMemo(() => Verses as VerseDetails[], []);


  let currIdx = typeof verse?.VerseIndex === "number" ? verse.VerseIndex : -1;
  currIdx = currIdx - 1;

  const prevVerse = currIdx > 0 ? verseList[currIdx - 1] : undefined;
  const nextVerse =
    currIdx >= 0 && currIdx < verseList.length - 1 ? verseList[currIdx + 1] : undefined;


  const displayVerse = React.useMemo<VerseDetails>(() => {
    if (currIdx >= 0) {
      return { ...verse, ...verseList[currIdx] };
    }
    return verse;
  }, [currIdx, verse, verseList]);


  return (
    <View style={styles.responseCard}>
      {prevVerse && (
        <View style={[styles.verseBlock, styles.prevNextBlock]}>
          <Text style={styles.prevNextLabel}>Previous</Text>
          <Text style={styles.arabicText}>{prevVerse.VerseWithHarakat}</Text>
          <Text style={styles.englishText}>{prevVerse.VerseEnglish}.</Text>
        </View>
      )}

      {/* Current Verse */}
      <View style={styles.currentBlock}>
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Surah</Text>
          <Text style={styles.responseValue}>
            {displayVerse.SurahNumber}. {displayVerse.SurahNameTransliteration} - {displayVerse.SurahNameEnglish}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Ayah</Text>
          <Text style={styles.responseValue}>{displayVerse.VerseNumber}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.verseBlock}>
          <Text style={styles.responseLabel}>Verse</Text>
          <Text style={styles.arabicText}>{displayVerse.VerseWithHarakat}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.verseBlock}>
          <Text style={styles.responseLabel}>Translation</Text>
          {keyword ? (
            <Highlighted text={displayVerse.VerseEnglish} query={keyword} />
          ) : (
            <Text style={styles.englishText}>{displayVerse.VerseEnglish}.</Text>
          )}
        </View>

        <Button
          title="Go to Surah"
          onPress={() => {
            router.push(`/Chapter?surahStr=${displayVerse.SurahNumber}`)
            }}
        />
      </View>

      {nextVerse && (
        <View style={[styles.verseBlock, styles.prevNextBlock]}>
          <Text style={styles.prevNextLabel}>Next</Text>
          <Text style={styles.arabicText}>{nextVerse.VerseWithHarakat}</Text>
          <Text style={styles.englishText}>{nextVerse.VerseEnglish}.</Text>
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
    backgroundColor: "#fff8dc",
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    width: "100%",
  },

  prevNextBlock: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
  },

  prevNextLabel: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },

  englishText: {
  fontSize: 16,
  fontWeight: "500",
  color: "#111827",
  marginTop: 6,
  lineHeight: 22,
},
});
