// Lightweight recent-searches storage using AsyncStorage (mobile only).
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VerseDetails = {
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
} | null;

export type AudioHistoryItem = VerseDetails & { searchedAt: number};
export type KeywordHistoryItem = {searchedAt: number, searchTerm: String}

const AUDIO_STORAGE_KEY = "@ayat/recent_audio_searches";
const KEYWORD_STORAGE_KEY = "@ayat/recent_keyword_searches";
const MAX_ITEMS = 50;

function getId(v: VerseDetails) {
  return `S:${v.SurahNumber}-A:${v.VerseNumber}`;
}

async function readStore(fromWhere: String = ""): Promise<AudioHistoryItem[] | KeywordHistoryItem[]> {


  try {
    let raw;
    if (fromWhere == "keyword"){
      raw = await AsyncStorage.getItem(KEYWORD_STORAGE_KEY)
    }else{
      raw = await AsyncStorage.getItem(AUDIO_STORAGE_KEY);
    }
    
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (fromWhere == "keyword"){return parsed as KeywordHistoryItem[];
    }
    else{return parsed as AudioHistoryItem[];
    }
    
    return [];
  } catch {
    return [];
  }
}

async function writeStore(items: AudioHistoryItem[] | KeywordHistoryItem[], fromWhere: String = ""): Promise<void> {
  if (fromWhere == "keyword"){
    await AsyncStorage.setItem(KEYWORD_STORAGE_KEY, JSON.stringify(items));
  }
  await AsyncStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(items));
}

export async function getHistory(fromWhere: String = ""): Promise<AudioHistoryItem[] | KeywordHistoryItem[]> {
  const list = await readStore(fromWhere);
  // newest first
  return list.sort((a, b) => b.searchedAt - a.searchedAt);
}

export async function clearHistory(fromWhere: String = ""): Promise<void> {
  if (fromWhere == "keyword"){
    await AsyncStorage.removeItem(KEYWORD_STORAGE_KEY);
  }else{
    await AsyncStorage.removeItem(AUDIO_STORAGE_KEY);
  }
}

export async function removeFromHistory(verse: VerseDetails, fromWhere: String = "", searchTerm: String = ""): Promise<void> {
  const list = await readStore(fromWhere)
  let next;

  if (fromWhere == "keyword"){
    next = list.filter((item) => item.searchTerm !== searchTerm)
  }else{
    const id = getId(verse);
    next = list.filter((item) => getId(item) !== id);
  }

  await writeStore(next, fromWhere);
}

export async function addSearchedVerse(verseData: VerseDetails = null, fromWhere: String = "", searchTerm: String = ""): Promise<void> {
  
  const now = Date.now();
  let id = "dkeguh" // jsut so it never matches
  if (!fromWhere){
     id = getId(verseData);
  }

  const list = await readStore(fromWhere);
  let without;

  if (fromWhere == "keyword"){
    without = list.filter((item) => item.searchTerm !== searchTerm)
  } else{
    without = list.filter((item) => getId(item) !== id);
  }

  
  if (!fromWhere){
    let next: AudioHistoryItem[];
    next = [
      { ...verseData, searchedAt: now },
      ...without,
    ];
  }else{
    let next: KeywordHistoryItem[];
    next = [
      {searchedAt: now, searchTerm: searchTerm},
      ...without,
    ]
  }
  
  if (next.length > MAX_ITEMS) next.length = MAX_ITEMS;
  await writeStore(next);
}

export async function addSearchedKeyword(searchTerm: String = "", topResult: VerseDetails): Promise<void>{
  const now = Date.now();
  const list = await readStore();
}

export function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (seconds < 120) return "just now";
  if (minutes < 60) return minutes + " mins ago";
  if (hours == 1) return hours + " hr ago";
  if (hours < 24) return hours + " hrs ago";
  if (days === 1) return "yesterday";
  if (days < 7) return days + " days ago";

  const date = new Date(timestamp);
  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getDate()
  );
}
