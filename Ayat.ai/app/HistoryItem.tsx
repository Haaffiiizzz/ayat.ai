import VerseResult from '@/components/VerseResult';
import { StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function HistoryItem(){
    const { data } = useLocalSearchParams<{ data?: string | string[] }>();
    const serializedItem = Array.isArray(data) ? data[0] : data;
    if (!serializedItem) return null;
    const item = JSON.parse(serializedItem);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center',
    justifyContent: 'center',}}>
            <VerseResult verse={item} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20,
  },

  centered: {

  }
})
