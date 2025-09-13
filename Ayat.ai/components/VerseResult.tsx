import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Highlighted from "@/utils/highlighted";
import Verses from "@/utils/Verses.json"; // Import your Verses.json

type VerseDetails = {
  SurahNumber: number | string;
  VerseNumber: number;
  VerseWithHarakat: string;
  VerseEnglish: string;
  VerseIndex: number;
};

type Props = {
  verse: VerseDetails;
  keyword?: string;
};

export default function VerseResult({ verse, keyword }: Props) {
  // Get previous and next verses by index
  const prevVerse = Verses[verse.VerseIndex - 1];
  const nextVerse = Verses[verse.VerseIndex + 1];

  console.log("Current:", verse);
  console.log("Prev:", prevVerse);
  console.log("Next:", nextVerse);
  return (
    
    <View style={styles.responseCard}>

      {/* Previous Verse */}
      {prevVerse && (
        <>
          <View style={styles.divider} />
          <View style={styles.responseRow}>
            <Text style={styles.responseLabel}>Previous</Text>
            <Text style={styles.arabicText}>{prevVerse.VerseWithHarakat}</Text>
          </View>
        </>
      )}

      {/* Current Verse */}
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

      

      {/* Next Verse */}
      {nextVerse && (
        <>
          <View style={styles.divider} />
          <View style={styles.responseRow}>
            <Text style={styles.responseLabel}>Next</Text>
            <Text style={styles.arabicText}>{nextVerse.VerseWithHarakat}</Text>
          </View>
        </>
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
    color: "#6b7280",
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
});

