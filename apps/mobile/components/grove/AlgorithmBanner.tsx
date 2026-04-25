import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AlgorithmBannerProps {
  onDismiss: () => void;
}

export function AlgorithmBanner({ onDismiss }: AlgorithmBannerProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: top + 8 }]}>
      <Ionicons name="eye" size={18} color="#e879f9" />
      <Text style={styles.text} numberOfLines={2}>
        The Algorithm is watching. Your build has been delayed.
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1e0a2e',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    flex: 1,
    color: '#e9d5ff',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
  },
  dismissBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  dismissText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
