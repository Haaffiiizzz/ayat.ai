import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { HistoryItem, formatTime } from '@/utils/history';

type Props = {
  item: HistoryItem;
  onPress?: (term: string) => void;
};

export default function KeywordHistoryItem({ item, onPress }: Props) {
  const term = item.searchTerm || '';
  const timestamp = item.searchedAt;
  const surah = item.SurahNameTransliteration;
  const verseNumber = item.VerseNumber;
  const versePreview = item.VerseEnglish;
  const typeLabel =
    item.searchType === 'keyword' || item.searchType === 'Search'
      ? 'Keyword'
      : item.searchType || 'Keyword';

  const handlePress = () => {
    if (!term) return;
    onPress?.(term);
  };

  return (
    <TouchableOpacity style={styles.historyItem} onPress={handlePress} disabled={!term}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.term} numberOfLines={1}>
            {term || 'Unknown keyword'}
          </Text>

          {(surah || versePreview) && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {surah ? `${surah}${verseNumber ? `: ${verseNumber}` : ''}` : ''}{surah && versePreview ? ' — ' : ''}{versePreview || ''}
            </Text>
          )}
        </View>

        <View style={styles.typePill}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>

        {!!timestamp && (
          <Text style={styles.time}>
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  historyItem: {
    width: '100%',
    alignSelf: 'stretch',
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
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  term: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    marginLeft: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});
