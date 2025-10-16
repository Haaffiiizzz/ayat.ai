import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';

type Props = {
  recording: Audio.Recording;
  barCount?: number;
};

export default function RecordingIndicator({ recording, barCount = 5 }: Props) {
  const [liveDuration, setLiveDuration] = useState<string>('0:00');

  // Animated equalizer bars
  const barScales = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.4))
  ).current;
  const barAnimations = useRef<Animated.CompositeAnimation[]>([]);

  // Start/stop looping animations while recording is active
  useEffect(() => {
    if (recording) {
      barAnimations.current = barScales.map((val, idx) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: 1,
              duration: 300 + idx * 70,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(val, {
              toValue: 0.3,
              duration: 350 + idx * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        loop.start();
        return loop;
      });
    }

    return () => {
      // stop animations and reset sizes on unmount or when recording changes
      barAnimations.current.forEach((a) => a.stop && a.stop());
      barScales.forEach((v) => v.setValue(0.4));
      barAnimations.current = [];
    };
  }, [recording]);

  // Live timer update while recording
  useEffect(() => {
    let interval: NodeJS.Timer | null = null;

    const tick = async () => {
      try {
        if (recording) {
          const status = await recording.getStatusAsync();
          if ('isRecording' in status && (status as any).isRecording && 'durationMillis' in status) {
            const ms = (status as any).durationMillis as number;
            const mins = Math.floor(ms / 1000 / 60);
            const secs = Math.floor((ms / 1000) % 60);
            setLiveDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
          }
        }
      } catch {
        // ignore transient status errors
      }
    };

    // initial immediate tick then interval
    tick();
    interval = setInterval(tick, 250);

    return () => {
      if (interval) clearInterval(interval);
      setLiveDuration('0:00');
    };
  }, [recording]);

  return (
    <View style={styles.recordingIndicator}>
      <View style={styles.recordingHeader}>
        <View style={styles.pulseDot} />
        <Text style={styles.recordingText}>Recording</Text>
        <Text style={styles.recordingTimer}>{liveDuration}</Text>
      </View>
      <View style={styles.equalizer}>
        {barScales.map((val, i) => (
          <Animated.View
            key={`bar-${i}`}
            style={[
              styles.eqBar,
              {
                transform: [
                  {
                    scaleY: val,
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recordingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  recordingText: {
    color: '#FF3B30',
    fontWeight: '700',
    marginRight: 10,
  },
  recordingTimer: {
    fontVariant: ['tabular-nums'],
    color: '#111827',
    fontWeight: '600',
  },
  equalizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
    gap: 6,
  },
  eqBar: {
    width: 8,
    height: 26,
    backgroundColor: '#FF3B30',
    borderRadius: 2,
  },
});

