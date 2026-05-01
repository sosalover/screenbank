import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/store/gameStore';

const STEPS = [
  {
    title: 'Welcome to your Grove',
    body: "This is where your reclaimed time comes to life. Every minute you spend off your phone builds something real here.",
  },
  {
    title: "Grover's Timebank",
    body: "Stay under your daily screen budget and Grover banks the difference as minutes. Those minutes are yours to spend.",
  },
  {
    title: 'Fund Real Causes',
    body: "Head to Causes and spend your minutes on things that matter — planting trees, sheltering animals, cleaning the ocean.",
  },
  {
    title: 'Grover Gets to Work',
    body: "Once you fund a cause, Grover builds it right here in the grove. Come back to see it grow.",
  },
];

export function TutorialOverlay() {
  const { dispatch } = useGame();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function handleNext() {
    if (isLast) {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dim background */}
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Card */}
      <View style={[styles.card, { paddingBottom: bottom + 20, width: width - 32, alignSelf: 'center' }]}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>

        {/* Step dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{isLast ? 'Start exploring →' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#14532d',
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d1fae5',
  },
  dotActive: {
    backgroundColor: '#16a34a',
    width: 20,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
