import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Build, formatTimeRemaining } from "@/store/gameStore";

interface ItemInfoSheetProps {
  build: Build;
  onClose: () => void;
}

export function ItemInfoSheet({ build, onClose }: ItemInfoSheetProps) {
  const { bottom } = useSafeAreaInsets();
  const isInProgress =
    build.status === "in_progress" || build.status === "delayed";
  const isDelayed = build.status === "delayed";

  return (
    <View style={[styles.container, { paddingBottom: bottom + 16 }]}>
      <View style={styles.handle} />
      <View style={styles.row}>
        <View style={[styles.iconWrap, isDelayed && styles.iconWrapDelayed]}>
          <Ionicons
            name={build.cause.icon as any}
            size={32}
            color={isDelayed ? "#ef4444" : "#16a34a"}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{build.cause.name}</Text>
          <Text style={styles.charity}>{build.cause.charity}</Text>
          <Text style={styles.impact}>{build.cause.impact}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        {isInProgress ? (
          <>
            <View
              style={[
                styles.badge,
                isDelayed ? styles.badgeDelayed : styles.badgeActive,
              ]}
            >
              <Ionicons
                name={isDelayed ? "eye" : "hammer-outline"}
                size={13}
                color={isDelayed ? "#ef4444" : "#16a34a"}
              />
              <Text
                style={[
                  styles.badgeText,
                  isDelayed ? styles.badgeTextDelayed : styles.badgeTextActive,
                ]}
              >
                {isDelayed ? "Delayed by The Algorithm" : "In Progress"}
              </Text>
            </View>
            <Text style={styles.timer}>
              {formatTimeRemaining(build.completesAt)} remaining
            </Text>
          </>
        ) : (
          <View style={[styles.badge, styles.badgeComplete]}>
            <Ionicons name="checkmark-circle" size={13} color="#16a34a" />
            <Text style={[styles.badgeText, styles.badgeTextActive]}>
              Complete
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDelayed: {
    backgroundColor: "#fff1f2",
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 2 },
  charity: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
    marginBottom: 4,
  },
  impact: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
  },
  badgeActive: { backgroundColor: "#f0fdf4" },
  badgeDelayed: { backgroundColor: "#fff1f2" },
  badgeComplete: { backgroundColor: "#f0fdf4" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextActive: { color: "#16a34a" },
  badgeTextDelayed: { color: "#ef4444" },
  timer: { fontSize: 13, color: "#6b7280" },
  closeBtn: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 12,
  },
  closeBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },
});
