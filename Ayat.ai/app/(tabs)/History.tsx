import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory, clearHistory, HistoryItem, formatTime } from '@/utils/history';
import { useRouter } from 'expo-router';
import KeywordHistoryItem from '../KeywordHistoryItem';

type CombinedHistory = HistoryItem & { searchType?: string };

const isKeywordType = (t?: string) => t === 'keyword' || t === 'Search' || t === 'search';
const normalizeType = (t?: string) => (isKeywordType(t) ? 'keyword' : t);

export default function History() {
  const [items, setItems] = useState<CombinedHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const audio = await getHistory();
      const keyword = await getHistory('keyword');

      const normalize = (list: HistoryItem[], fallback: 'audio' | 'keyword') =>
        list.map((item) => ({
          ...item,
          searchType: normalizeType(item.searchType) || fallback,
        }));

      const merged = [...normalize(audio, 'audio'), ...normalize(keyword, 'keyword')];
      merged.sort((a, b) => (b.searchedAt || 0) - (a.searchedAt || 0));

      setItems(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const clearAll = async () => {
    await clearHistory();
    await clearHistory('keyword');
    load();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Activity</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Button title="Clear All" onPress={clearAll} disabled={items.length === 0 || loading} />
        </View>
      </View>

      {loading && <Text style={styles.muted}>Loading…</Text>}
      {!loading && items.length === 0 && <Text style={styles.muted}>No history yet.</Text>}

      {!loading &&
        items.map((item, idx) => {
      if (isKeywordType(item.searchType)) {
            return (
              <KeywordHistoryItem
                key={item.VerseID || `${item.searchTerm || 'keyword'}-${idx}`}
                item={item}
                onPress={(term) =>
                  router.push({
                    pathname: '/(tabs)/Search',
                    params: { keyword: term },
                  })
                }
              />
            );
          }

          // audio (default) entry
          return (
            <TouchableOpacity
              style={styles.historyItem}
              key={item.VerseID || `${item.searchType || 'audio'}-${idx}`}
              onPress={() => {
                router.push({
                  pathname: '../HistoryItem',
                  params: { data: JSON.stringify(item) },
                });
              }}
            >
              <View style={styles.row}>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>
                    {item.SurahNameTransliteration}: {item.VerseNumber}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {item.VerseEnglish}
                  </Text>
                </View>

                <View style={styles.typePill}>
                  <Text style={styles.typeText}>Audio</Text>
                </View>

                <Text style={styles.time}>{formatTime(item.searchedAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'white',
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
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginLeft: 12,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    marginHorizontal: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#4338CA',
    fontWeight: '700',
  },
});
