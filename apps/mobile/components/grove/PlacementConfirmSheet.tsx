import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CauseItem } from '@/store/gameStore';

interface PlacementConfirmSheetProps {
  cause: CauseItem;
  cell: { col: number; row: number };
  onConfirm: () => void;
  onCancel: () => void;
}

export function PlacementConfirmSheet({ cause, cell, onConfirm, onCancel }: PlacementConfirmSheetProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: bottom + 16 }]}>
      <View style={styles.handle} />
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={cause.icon as any} size={32} color="#16a34a" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{cause.name}</Text>
          <Text style={styles.charity}>{cause.charity}</Text>
          <Text style={styles.impact}>{cause.impact}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="timer-outline" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{cause.minuteCost} min</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
        <Ionicons name="hammer-outline" size={18} color="#fff" />
        <Text style={styles.confirmText}>Start Building</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Choose a different tile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 2 },
  charity: { fontSize: 12, fontWeight: '600', color: '#16a34a', marginBottom: 4 },
  impact: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  meta: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6b7280' },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#6b7280', fontSize: 14 },
});
