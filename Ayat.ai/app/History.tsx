import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VerseResult from '@/components/VerseResult';
import { getHistory, clearHistory, HistoryItem } from '@/utils/history';

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

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
        <VerseResult key={item.VerseID} verse={item} />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  muted: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
