import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import { sendAudioToAPI } from '@/utils/helper';

type RecordingItem = {
  sound: Audio.Sound;
  duration: string;
  file: string | null;
};

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<RecordingItem | null>(null);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        await newRecording.startAsync();
        setRecording(newRecording);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setRecording(null);
    await recording.stopAndUnloadAsync();

    const { sound, status } = await recording.createNewLoadedSoundAsync();
    let duration = '0:00';
    if ('isLoaded' in status && status.isLoaded && 'durationMillis' in status && typeof status.durationMillis === 'number') {
      duration = getDurationFormatted(status.durationMillis);
    }
    const file = recording.getURI();

    const newRecordingItem: RecordingItem = { sound, duration, file };
    setRecordedAudio(newRecordingItem);

    // --- Send audio to external function here ---
    if (file) {const res = await sendAudioToAPI(file);
      console.log(res)
    }
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.round((milliseconds / 1000) % 60);
    return seconds < 10
      ? `${minutes}:0${seconds}`
      : `${minutes}:${seconds}`;
  }

  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />

      {recordedAudio && (
        <View style={styles.row}>
          <Text style={styles.fill}>Duration: {recordedAudio.duration}</Text>
          <Button onPress={() => recordedAudio.sound.replayAsync()} title="Play" />
          <Button onPress={() => setRecordedAudio(null)} title="Clear Recording" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
});
