import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGame, formatTimeRemaining } from "@/store/gameStore";
import { useAuth } from "@/store/authStore";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AccountScreen() {
  const { state } = useGame();
  const { signOut } = useAuth();

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  }
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
          <Ionicons name="person-circle" size={40} color="#16a34a" />
        </View>
        <View style={{ gap: 4 }}>
          <Text style={styles.name}>Alex</Text>
          <View style={styles.statRow}>
            <Ionicons name="flame" size={13} color="#6b7280" />
            <Text style={styles.subtitle}>{state.streak} day streak</Text>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="timer-outline" size={13} color="#6b7280" />
            <Text style={styles.subtitle}>{state.minuteBalance} min saved</Text>
          </View>
          {state.algorithmRaids > 0 && (
            <View style={styles.statRow}>
              <Ionicons name="eye" size={13} color="#ef4444" />
              <Text style={styles.raidStat}>The Algorithm raided {state.algorithmRaids}×</Text>
            </View>
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
              <Ionicons name={build.cause.icon as any} size={28} color={build.status === "delayed" ? "#ef4444" : "#16a34a"} />
              <View style={styles.buildInfo}>
                <Text style={styles.buildName}>{build.cause.name}</Text>
                <Text style={styles.buildCharity}>{build.cause.charity}</Text>
                <Text style={[styles.buildTimer, build.status === "delayed" && styles.buildTimerDelayed]}>
                  {build.status === "delayed"
                    ? `Delayed · ${formatTimeRemaining(build.completesAt)} left`
                    : `${formatTimeRemaining(build.completesAt)} remaining`}
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
            <View key={name} style={styles.statRow}>
              <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
              <Text style={styles.impactText}>{count}× {name}</Text>
            </View>
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
              <Ionicons name={build.cause.icon as any} size={28} color="#16a34a" />
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
      {/* Sign out */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
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
  name: { fontSize: 22, fontWeight: "800", color: "#111" },
  statRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { fontSize: 13, color: "#d1d5db" },
  subtitle: { fontSize: 13, color: "#6b7280" },
  raidStat: { fontSize: 12, color: "#ef4444" },
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
  buildInfo: { flex: 1 },
  buildName: { fontSize: 15, fontWeight: "600", color: "#111" },
  buildCharity: { fontSize: 12, color: "#16a34a", marginTop: 1 },
  buildTimer: { fontSize: 12, color: "#6b7280", marginTop: 3 },
  buildTimerDelayed: { color: "#ef4444" },
  impactText: { fontSize: 15, color: "#16a34a", fontWeight: "600" },
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
  historyInfo: { flex: 1 },
  historyName: { fontSize: 15, fontWeight: "600", color: "#111" },
  historyCharity: { fontSize: 12, color: "#16a34a", marginTop: 1 },
  historyDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  historyCost: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  signOutBtn: {
    marginTop: 8,
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#fff1f2",
  },
  signOutText: { fontSize: 15, fontWeight: "600", color: "#ef4444" },
});
