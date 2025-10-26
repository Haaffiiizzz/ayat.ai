import React from "react";
import { Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  responseValue: {
    // Add your styles here
    flex: 1,                // value takes remaining space
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  highlight: {
    backgroundColor: "#fff3b0",
    fontWeight: "800",
  },
});

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query?.trim()) return <Text style={styles.responseValue}>{text}</Text>;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi"); // exact string, case-insensitive
  const parts = text.split(regex);

  return (
    <Text style={styles.responseValue}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={styles.highlight}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}.
    </Text>
  );
}

export default Highlighted;
