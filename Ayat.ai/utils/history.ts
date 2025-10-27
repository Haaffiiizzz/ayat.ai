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

export type HistoryItem = VerseDetails & { searchedAt: number };

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

export async function addSearchedVerse(verse: VerseDetails): Promise<void> {
  if (!verse || !verse.VerseID) return;
  const now = Date.now();
  const id = getId(verse);

  const list = await readStore();
  const without = list.filter((item) => getId(item) !== id);
  const next: HistoryItem[] = [
    { ...verse, searchedAt: now },
    ...without,
  ];
  if (next.length > MAX_ITEMS) next.length = MAX_ITEMS;
  await writeStore(next);
}
