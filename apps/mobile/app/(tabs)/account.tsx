import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame, formatTimeRemaining } from "@/store/gameStore";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AccountScreen() {
  const { state } = useGame();
  const { completedBuilds, activeBuilds } = state;

  const impact: Record<string, number> = {};
  completedBuilds.forEach((b) => {
    impact[b.cause.name] = (impact[b.cause.name] ?? 0) + 1;
  });

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🌿</Text>
        </View>
        <View>
          <Text style={styles.name}>Alex</Text>
          <Text style={styles.subtitle}>
            🔥 {state.streak} day streak · ⏱ {state.minuteBalance} min saved
          </Text>
          {state.algorithmRaids > 0 && (
            <Text style={styles.raidStat}>
              👁 The Algorithm raided {state.algorithmRaids}×
            </Text>
          )}
        </View>
      </View>

      {/* Active builds */}
      {activeBuilds.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Build</Text>
          {activeBuilds.map((build) => (
            <View
              key={build.id}
              style={[styles.buildRow, build.status === "delayed" && styles.buildRowDelayed]}
            >
              <Text style={styles.buildEmoji}>{build.cause.emoji}</Text>
              <View style={styles.buildInfo}>
                <Text style={styles.buildName}>{build.cause.name}</Text>
                <Text style={styles.buildCharity}>{build.cause.charity}</Text>
                <Text style={[styles.buildTimer, build.status === "delayed" && styles.buildTimerDelayed]}>
                  {build.status === "delayed"
                    ? `👁 Delayed · ${formatTimeRemaining(build.completesAt)} left`
                    : `⏳ ${formatTimeRemaining(build.completesAt)} remaining`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Impact summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        {Object.entries(impact).length === 0 ? (
          <Text style={styles.empty}>No completed builds yet — head to Causes to get started.</Text>
        ) : (
          Object.entries(impact).map(([name, count]) => (
            <Text key={name} style={styles.impactText}>
              ✅ {count}× {name}
            </Text>
          ))
        )}
      </View>

      {/* Completed history */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed</Text>
        {completedBuilds.length === 0 ? (
          <Text style={styles.empty}>Completed builds will appear here.</Text>
        ) : (
          [...completedBuilds].reverse().map((build, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyEmoji}>{build.cause.completedEmoji}</Text>
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{build.cause.name}</Text>
                <Text style={styles.historyCharity}>{build.cause.charity}</Text>
                <Text style={styles.historyDate}>{formatDate(build.startedAt)}</Text>
              </View>
              <Text style={styles.historyCost}>−⏱ {build.cause.minuteCost}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 20, paddingBottom: 40 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 32 },
  name: { fontSize: 22, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  raidStat: { fontSize: 12, color: "#ef4444", marginTop: 2 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 12 },
  empty: { color: "#9ca3af", fontSize: 14 },
  buildRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  buildRowDelayed: {
    backgroundColor: "#fff1f2",
    borderColor: "#fca5a5",
  },
  buildEmoji: { fontSize: 28 },
  buildInfo: { flex: 1 },
  buildName: { fontSize: 15, fontWeight: "600", color: "#111" },
  buildCharity: { fontSize: 12, color: "#16a34a", marginTop: 1 },
  buildTimer: { fontSize: 12, color: "#6b7280", marginTop: 3 },
  buildTimerDelayed: { color: "#ef4444" },
  impactText: { fontSize: 15, color: "#16a34a", fontWeight: "600", paddingVertical: 4 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  historyEmoji: { fontSize: 28 },
  historyInfo: { flex: 1 },
  historyName: { fontSize: 15, fontWeight: "600", color: "#111" },
  historyCharity: { fontSize: 12, color: "#16a34a", marginTop: 1 },
  historyDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  historyCost: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
});
