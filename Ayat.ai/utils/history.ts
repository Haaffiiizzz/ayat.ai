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

export type HistoryItem = Partial<VerseDetails> & {
  searchedAt: number;
  searchType?: string;
  searchTerm?: string;
};

const AUDIO_STORAGE_KEY = "@ayat/recent_audio_searches";
const KEYWORD_STORAGE_KEY = "@ayat/recent_keyword_searches";
const MAX_ITEMS = 50;

function getId(v: VerseDetails) {
  return `S:${v.SurahNumber}-A:${v.VerseNumber}`;
}

function hasVerseFields(item: Partial<VerseDetails>): item is VerseDetails {
  return (
    !!item &&
    typeof item.SurahNumber === "number" &&
    typeof item.VerseNumber === "number" &&
    typeof item.VerseID === "string"
  );
}

async function readStore(fromWhere: String = ""): Promise<HistoryItem[]> {
  const isKeyword = fromWhere === "keyword" || fromWhere === "Search";
  try {
    let raw;
    if (isKeyword) {
      raw = await AsyncStorage.getItem(KEYWORD_STORAGE_KEY);
    } else {
      raw = await AsyncStorage.getItem(AUDIO_STORAGE_KEY);
    }
    
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as HistoryItem[];
    return [];
  } catch {
    return [];
  }
}

async function writeStore(items: HistoryItem[], fromWhere: String = ""): Promise<void> {
  const isKeyword = fromWhere === "keyword" || fromWhere === "Search";
  if (isKeyword) {
    await AsyncStorage.setItem(KEYWORD_STORAGE_KEY, JSON.stringify(items));
  } else {
    await AsyncStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(items));
  }
}

export async function getHistory(fromWhere: String = ""): Promise<HistoryItem[]> {
  const list = await readStore(fromWhere);
  // newest first
  return list.sort((a, b) => b.searchedAt - a.searchedAt);
}

export async function clearHistory(fromWhere: String = ""): Promise<void> {
  if (fromWhere === "keyword" || fromWhere === "Search") {
    await AsyncStorage.removeItem(KEYWORD_STORAGE_KEY);
  } else {
    await AsyncStorage.removeItem(AUDIO_STORAGE_KEY);
  }
}

export async function removeFromHistory(verse: VerseDetails, fromWhere: String = "", searchTerm: String = ""): Promise<void> {
  const isKeyword = fromWhere === "keyword" || fromWhere === "Search";
  const list = await readStore(fromWhere);
  let next: HistoryItem[];

  if (isKeyword) {
    next = list.filter((item) => item.searchTerm !== searchTerm);
  } else {
    if (!verse || !hasVerseFields(verse)) return;
    const id = getId(verse);
    next = list.filter((item) => !(hasVerseFields(item) && getId(item) === id));
  }

  await writeStore(next, fromWhere);
}

export async function addSearchedVerse(verseData: VerseDetails | null, fromWhere: String = "", searchTerm: String = ""): Promise<void> {
  const isKeyword = fromWhere === "keyword" || fromWhere === "Search";
  const now = Date.now();
  const list = await readStore(isKeyword ? "keyword" : "");

  let next: HistoryItem[];

  if (!isKeyword) {
    if (!verseData || !hasVerseFields(verseData)) return;
    const id = getId(verseData);
    const without = list.filter((item) => !(hasVerseFields(item) && getId(item) === id));
    next = [
      { ...verseData, searchedAt: now, searchType: fromWhere || "audio", searchTerm },
      ...without,
    ];
  } else {
    const without = list.filter((item) => item.searchTerm !== searchTerm);

    // Store a lightweight preview of the top result (if available) so the list can display it.
    const preview = verseData
      ? {
          VerseID: verseData.VerseID,
          SurahNameTransliteration: verseData.SurahNameTransliteration,
          SurahNumber: verseData.SurahNumber,
          VerseNumber: verseData.VerseNumber,
          VerseEnglish: verseData.VerseEnglish,
        }
      : {};

    const keywordEntry: HistoryItem = {
      ...preview,
      searchedAt: now,
      searchType: "keyword",
      searchTerm,
    };
    next = [keywordEntry, ...without];
  }

  if (next.length > MAX_ITEMS) next.length = MAX_ITEMS;
  await writeStore(next, isKeyword ? "keyword" : "");
}

export async function addSearchedKeyword(searchTerm: String = "", topResult: VerseDetails): Promise<void>{
  await addSearchedVerse(topResult, "keyword", searchTerm);
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
