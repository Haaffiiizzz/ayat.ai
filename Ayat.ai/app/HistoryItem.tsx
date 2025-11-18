import VerseResult from '@/components/VerseResult'; 
import { useLocalSearchParams } from 'expo-router';

export default function HistoryItem(){
    const { data } = useLocalSearchParams();
    const item = JSON.parse(data);

    return (
        <VerseResult verse={item} />
    )
}