import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Highlighted from "@/utils/highlighted";
import Verses from "@/utils/Verses.json"; // Import your Verses.json

type VerseDetails = {
        "VerseID": string,
        "SurahNumber": number,
        "VerseNumber": number,
        "SurahNameArabic": string,
        "SurahNameTransliteration": string,
        "SurahNameEnglish": string,
        "VerseWithHarakat": string,
        "VerseWithoutHarakat": string,
        "VerseEnglish": string,
        "VerseIndex": number
}

type Props = {
  verse: VerseDetails;
  keyword?: string;
};

export default function VerseResult({ verse, keyword }: Props) {
  // Get previous and next verses by index
  const prevVerse = Verses[verse.VerseIndex - 1];
  const nextVerse = Verses[verse.VerseIndex + 1];


  return (
    
    <View style={styles.responseCard}>

      {prevVerse && (
        <View style={[styles.verseBlock, styles.prevNextBlock]}>
          <Text style={styles.prevNextLabel}>Previous</Text>
          <Text style={styles.arabicText}>{prevVerse.VerseWithHarakat}</Text>
          <Text style={styles.responseValue}>{prevVerse.VerseEnglish}</Text>
        </View>
      )}

      {/* Current Verse */}         
      <View style={styles.currentBlock}>
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Surah</Text>
          <Text style={styles.responseValue}>{verse.SurahNumber}</Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Ayah</Text>
          <Text style={styles.responseValue}>{verse.VerseNumber}</Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Verse</Text>
          <Text style={styles.arabicText}>{verse.VerseWithHarakat}</Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.responseRow}>
          <Text style={styles.responseLabel}>Translation</Text>
          {keyword ? (
            <Highlighted text={verse.VerseEnglish} query={keyword} />
          ) : (
            <Text style={styles.responseValue}>{verse.VerseEnglish}</Text>
          )}
        </View>
      </View>

      

      {nextVerse && (
        <View style={[styles.verseBlock, styles.prevNextBlock]}>
          <Text style={styles.prevNextLabel}>Next</Text>
          <Text style={styles.arabicText}>{nextVerse.VerseWithHarakat}</Text>
          <Text style={styles.responseValue}>{nextVerse.VerseEnglish}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  responseLabel: {
    width: 90,
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
    paddingTop: 2,
  },

  responseValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 6,
  },

  arabicText: {
    fontSize: 20,
    writingDirection: "rtl",
    textAlign: "right",
    lineHeight: 28,
    marginTop: 8,
    flex: 1,
  },

  verseBlock: {
  paddingVertical: 8,
},

currentBlock: {
  backgroundColor: "#fff8dc", // light highlight
  borderRadius: 8,
  padding: 8,
  marginVertical: 10,
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
}
  
});

