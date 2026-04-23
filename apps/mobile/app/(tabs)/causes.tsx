import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame, CAUSE_ITEMS, formatTimeRemaining } from "@/store/gameStore";

export default function CausesScreen() {
  const { state, dispatch } = useGame();
  const activeBuild = state.activeBuilds[0] ?? null;

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Causes</Text>
        <View style={styles.balanceBadge}>
          <Ionicons name="timer-outline" size={14} color="#166534" />
          <Text style={styles.balanceText}>{state.minuteBalance} min</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Spend your reclaimed time on something real</Text>

      {/* Active build */}
      {activeBuild && (
        <View style={[styles.activeBuildCard, activeBuild.status === "delayed" && styles.activeBuildDelayed]}>
          <Ionicons name={activeBuild.cause.icon as any} size={36} color={activeBuild.status === "delayed" ? "#ef4444" : "#16a34a"} />
          <View style={styles.activeBuildInfo}>
            <View style={styles.activeBuildTitleRow}>
              <Ionicons name={activeBuild.status === "delayed" ? "eye" : "hammer-outline"} size={12} color="#6b7280" />
              <Text style={styles.activeBuildTitle}>
                {activeBuild.status === "delayed" ? "Delayed by The Algorithm" : "In Progress"}
              </Text>
            </View>
            <Text style={styles.activeBuildName}>{activeBuild.cause.name}</Text>
            <Text style={styles.activeBuildTimer}>
              {formatTimeRemaining(activeBuild.completesAt)} remaining
            </Text>
          </View>
        </View>
      )}

      {/* Cause grid */}
      <View style={styles.grid}>
        {CAUSE_ITEMS.map((cause) => {
          const canAfford = state.minuteBalance >= cause.minuteCost;
          const builderBusy = state.activeBuilds.length > 0;
          const disabled = !canAfford || builderBusy;

          return (
            <View key={cause.id} style={styles.card}>
              <Ionicons name={cause.icon as any} size={32} color="#16a34a" style={styles.cardIcon} />
              <Text style={styles.cardName}>{cause.name}</Text>
              <Text style={styles.cardCharity}>{cause.charity}</Text>
              <Text style={styles.cardImpact}>{cause.impact}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.costRow}>
                <Ionicons name="timer-outline" size={12} color="#374151" />
                <Text style={styles.costText}>{cause.minuteCost} min</Text>
              </View>
              </View>
              <TouchableOpacity
                style={[styles.queueBtn, disabled && styles.queueBtnDisabled]}
                onPress={() => dispatch({ type: "QUEUE_BUILD", cause })}
                disabled={disabled}
              >
                <Text style={[styles.queueBtnText, disabled && styles.queueBtnTextDisabled]}>
                  {builderBusy
                    ? "Builder busy"
                    : canAfford
                    ? "Queue"
                    : `Need ${cause.minuteCost - state.minuteBalance} more min`}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#111" },
  balanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  balanceText: { fontSize: 15, fontWeight: "700", color: "#166534" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  activeBuildCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  activeBuildDelayed: {
    backgroundColor: "#fff1f2",
    borderColor: "#fca5a5",
  },
  activeBuildInfo: { flex: 1 },
  activeBuildTitleRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  activeBuildTitle: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  activeBuildName: { fontSize: 16, fontWeight: "700", color: "#111" },
  activeBuildTimer: { fontSize: 13, color: "#16a34a", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: { marginBottom: 8 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 },
  cardCharity: { fontSize: 11, color: "#16a34a", fontWeight: "600", marginBottom: 4 },
  cardImpact: { fontSize: 11, color: "#6b7280", marginBottom: 10, lineHeight: 15 },
  cardMeta: { marginBottom: 10 },
  costText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  queueBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  queueBtnDisabled: { backgroundColor: "#e5e7eb" },
  queueBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  queueBtnTextDisabled: { color: "#9ca3af" },
});
