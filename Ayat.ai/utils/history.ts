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
};

export type HistoryItem = VerseDetails & { searchedAt: number, searchType: String, searchTerm: String};

const STORAGE_KEY = "@ayat/recent_verses";
const MAX_ITEMS = 50;

function getId(v: VerseDetails) {
  return `S:${v.SurahNumber}-A:${v.VerseNumber}`;
}

async function readStore(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as HistoryItem[];
    return [];
  } catch {
    return [];
  }
}

async function writeStore(items: HistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getHistory(): Promise<HistoryItem[]> {
  const list = await readStore();
  // newest first
  return list.sort((a, b) => b.searchedAt - a.searchedAt);
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function removeFromHistory(verse: VerseDetails): Promise<void> {
  const id = getId(verse);
  const list = await readStore();
  const next = list.filter((item) => getId(item) !== id);
  await writeStore(next);
}

export async function addSearchedVerse(verseData: VerseDetails, searchType: String, searchTerm: String = ""): Promise<void> {
  
  const now = Date.now();
  let id = "dkeguh" // jsut so it never matches
  if (!searchTerm){
     id = getId(verseData);
  }

  const list = await readStore();
  const without = list.filter((item) => getId(item) !== id);

  let next: HistoryItem[];
  if (!searchTerm){
    next = [
    { ...verseData, searchedAt: now, searchType: searchType, searchTerm: searchTerm },
    ...without,
  ];
  }else{
    next = [
      {verse}
    ]
  }
  
  if (next.length > MAX_ITEMS) next.length = MAX_ITEMS;
  await writeStore(next);
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
