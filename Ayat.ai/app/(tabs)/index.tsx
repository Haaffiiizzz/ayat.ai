import * as React from 'react';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { sendAudioToAPI } from '@/utils/helper';
import { FontAwesome } from '@expo/vector-icons';
import VerseResult from '@/components/VerseResult';
import { addSearchedVerse, formatTime, getHistory } from '@/utils/history';
import type { HistoryItem } from '@/utils/history';
import RecordingIndicator from '@/components/RecordingIndicator';
import { useFocusEffect, useRouter } from 'expo-router';

type RecordingItem = {
  duration: string;
  file: string | null;
};

type APIResponse = {
        "VerseID": string,
        "SurahNumber": number,
        "VerseNumber": number,
        "SurahNameArabic": string,
        "SurahNameTransliteration": string,
        "SurahNameEnglish": string,
        "VerseWithHarakat": string,
        "VerseWithoutHarakat": string,
        "VerseEnglish": string,
        "VerseIndex": number
}

export default function App() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [recordedAudio, setRecordedAudio] = useState<RecordingItem | null>(null);
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(false);
  const [audioHistory, setAudioHistory] = useState<HistoryItem[]>([]);
  const [showAudioHistory, setShowAudioHistory] = useState(true);

  const loadAudioHistory = useCallback(async () => {
    const history = await getHistory();
    setAudioHistory(history);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAudioHistory();
    }, [loadAudioHistory])
  );


  async function startRecording() {
    setApiResponse(null)
    setShowAudioHistory(false);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (perm.granted) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          allowsBackgroundRecording: true,
        });

        await recorder.prepareToRecordAsync();
        recorder.record();
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recorderState.isRecording) return;

    await recorder.stop();

    const status = recorder.getStatus();
    let duration = '0:00';
    const durationMillis = recorderState.durationMillis || status.durationMillis || 0;
    if (durationMillis > 0) {
      duration = getDurationFormatted(durationMillis);
    }
    const file = recorder.uri ?? status.url;

    const newRecordingItem: RecordingItem = { duration, file };
    setRecordedAudio(newRecordingItem);

    // Call API and set response
    if (file) {
      setLoading(true);
      const response = await sendAudioToAPI(file);
      setApiResponse(response);
      // Save to recent history only from index page when a valid verse is found
      if (response && response.VerseID) {
        try {
          await addSearchedVerse(response as any, "Index"); //from utils/history
          await loadAudioHistory();
        } catch (e) {
          // non-fatal
          console.warn('Failed to add to history', e);
        }
      }
      setLoading(false);
    }
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.round((milliseconds / 1000) % 60);
    return seconds < 10
      ? `${minutes}:0${seconds}`
      : `${minutes}:${seconds}`;
  }

  const shouldShowAudioHistory = showAudioHistory && audioHistory.length > 0;
  const isInitial = !recorderState.isRecording && !loading && !apiResponse && !shouldShowAudioHistory;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={isInitial ? styles.centeredContent : styles.content}
    >
      <TouchableOpacity
        onPress={recorderState.isRecording ? stopRecording : startRecording}
        style={[
          styles.micButton,
          recorderState.isRecording ? styles.micButtonActive : null,
        ]}
      >
        <Text style={styles.micIcon}><FontAwesome name="microphone" size={40} color="white" />
</Text>
      </TouchableOpacity>
      {recorderState.isRecording && (
        <RecordingIndicator
          isRecording={recorderState.isRecording}
          durationMillis={recorderState.durationMillis}
        />
      )}

      {!showAudioHistory && !recorderState.isRecording && !loading && (
        <View style={styles.historyToggle}>
          <Button title="Show audio history" onPress={() => setShowAudioHistory(true)} />
        </View>
      )}

      {shouldShowAudioHistory && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Audio Searches</Text>
          {audioHistory.map((item, idx) => (
            <TouchableOpacity
              style={styles.historyItem}
              key={item.VerseID || `audio-${idx}`}
              onPress={() => {
                router.push({
                  pathname: '../HistoryItem',
                  params: { data: JSON.stringify(item) },
                });
              }}
            >
              <View style={styles.historyRow}>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyItemTitle}>
                    {item.SurahNameTransliteration}: {item.VerseNumber}
                  </Text>
                  <Text style={styles.historySubtitle} numberOfLines={1}>
                    {item.VerseEnglish}
                  </Text>
                </View>

                <Text style={styles.historyTime}>{formatTime(item.searchedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}


      {/* {recordedAudio && (
        <View style={styles.audioControls}>
          <Text style={styles.durationText}>
            Duration: {recordedAudio.duration}
          </Text>
          <View style={styles.buttonGroup}>
            <View style={styles.spacer} />
            <Button onPress={() => setRecordedAudio(null)} title="Clear Recording" />
          </View>
        </View>
      )} */}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing your recitation...</Text>
        </View>
)}


      {apiResponse && apiResponse.VerseID && (
      <VerseResult
        verse={apiResponse}
      />
    )}


      {apiResponse && !(apiResponse?.VerseID && apiResponse?.VerseWithHarakat && apiResponse?.VerseNumber) && (
        <Text style={styles.errorText}>Cannot find this verse!</Text>
      )}


    </ScrollView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  centeredContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 40,
  },

  fill: {
    flex: 1,
    margin: 15,
  },

  responseCard: {
    width: '90%',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#f9f9f9',
  },

  responseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  responseLabel: {
    width: 90,              // fixed label column
    fontSize: 14,
    color: '#6b7280',
    paddingTop: 2,
  },

  responseValue: {
    flex: 1,                // value takes remaining space
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
},

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 6,
  },

  arabicText: {
    fontSize: 20,
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 28,
    marginTop: 8,
    flex: 1,
  },

  audioControls: {
    marginTop: 20,
    alignItems: 'center',
  },

  durationText: {
    fontSize: 16,
    marginBottom: 10,
  },

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  spacer: {
    width: 12,
  },

  micButton: {
  width: 200,
  height: 200,
  borderRadius: 100,
  backgroundColor: '#007AFF',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
  },

  micButtonActive: {
    backgroundColor: '#FF3B30', // red when recording
  },

  micIcon: {
    fontSize: 40,
    color: '#fff',
  }, 

  historyToggle: {
    width: '90%',
    marginBottom: 12,
  },

  historySection: {
    width: '100%',
    marginBottom: 16,
  },

  historyTitle: {
    width: '90%',
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  historyItem: {
    width: '100%',
  },

  historyRow: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  historySubtitle: {
    fontSize: 14,
    color: '#555',
  },

  historyTime: {
    fontSize: 12,
    color: '#888',
  },

  loadingContainer: {
  marginTop: 20,
  alignItems: 'center',
  justifyContent: 'center',
},

loadingText: {
  marginTop: 10,
  fontSize: 16,
  color: '#007AFF',
  fontWeight: '600',
  fontStyle: 'italic',
}, 
errorText: {
  backgroundColor: '#ffe5e5',
  color: '#b30000',
  padding: 10,
  borderRadius: 8,
  textAlign: 'center',
  fontWeight: 'bold',
  marginTop: 20,
},



});
