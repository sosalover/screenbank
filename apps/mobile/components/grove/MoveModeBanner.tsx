import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Build } from '@/store/gameStore';

interface MoveModeBannerProps {
  build: Build;
  onCancel: () => void;
}

export function MoveModeBanner({ build, onCancel }: MoveModeBannerProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: top + 8 }]}>
      <Ionicons name="move-outline" size={18} color="#fff" />
      <Text style={styles.text} numberOfLines={1}>
        Moving {build.cause.name} — tap a tile
      </Text>
      <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
        <Ionicons name="close" size={18} color="#fff" />
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
    backgroundColor: '#0369a1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    padding: 2,
  },
});
