import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VerseResult from '@/components/VerseResult';
import { getHistory, clearHistory, HistoryItem, formatTime } from '@/utils/history';
import { useRouter } from 'expo-router';

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getHistory();
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Searches</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Button title="Clear All" onPress={async () => { await clearHistory(); load(); }} disabled={items.length === 0 || loading} />
        </View>
      </View>

      {loading && <Text style={styles.muted}>Loading…</Text>}
      {!loading && items.length === 0 && (
        <Text style={styles.muted}>No recent searches yet.</Text>
      )}

      {!loading && items.map((item) => (
        <TouchableOpacity style={styles.historyItem} key={item.VerseID} onPress={() => {
          router.push({
            pathname: "../HistoryItem",
            params: {data: JSON.stringify(item)}
          })
        }}>
          <View style={styles.row}>
            <View style={styles.textContainer}>

              <Text style={styles.title}>
                {item.SurahNameTransliteration}: {item.VerseNumber}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.VerseEnglish}
              </Text>

            </View>

            <Text style={styles.time}>
              {formatTime(item.searchedAt)}
            </Text>

          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  muted: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },

  row: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "white",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyItem: {
    width: '100%',
    alignSelf: 'stretch',
  },

  textContainer: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },

  time: {
    fontSize: 12,
    color: "#888",
    marginLeft: 12,
  },


});
