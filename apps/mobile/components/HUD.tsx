import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGame, formatTimeRemaining, formatMinutes } from "@/store/gameStore";

function StatCard({
  icon,
  iconColor,
  value,
  label,
}: {
  icon: string;
  iconColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
      <View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function HUD() {
  const { state } = useGame();
  const activeBuild = state.activeBuilds[0] ?? null;
  const minutesLeft = Math.max(0, state.screenTimeBudgetMinutes - state.screenTimeUsedMinutes);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard icon="timer-outline" iconColor="#16a34a" value={`${state.minuteBalance}m`} label="reclaimed" />
        <View style={styles.cardDivider} />
        <StatCard icon="phone-portrait-outline" iconColor="#0369a1" value={formatMinutes(minutesLeft)} label="left today" />
      </View>
      <View style={styles.rowDivider} />
      <View style={styles.row}>
        <StatCard icon="flame" iconColor="#f97316" value={state.streak} label="day streak" />
        <View style={styles.cardDivider} />
        <StatCard icon="checkmark-circle-outline" iconColor="#7c3aed" value={state.completedBuilds.length} label="builds done" />
      </View>
      <View style={styles.rowDivider} />
      <View style={styles.buildRow}>
        <Ionicons
          name={activeBuild ? (activeBuild.status === "delayed" ? "eye" : "hammer-outline") : "leaf-outline"}
          size={14}
          color={activeBuild ? (activeBuild.status === "delayed" ? "#ef4444" : "#16a34a") : "#9ca3af"}
        />
        {activeBuild ? (
          <>
            <Text style={[styles.buildText, activeBuild.status === "delayed" && styles.delayed]} numberOfLines={1}>
              {activeBuild.cause.emoji} {activeBuild.status === "delayed" ? "Delayed: " : ""}{activeBuild.cause.name}
            </Text>
            <Text style={styles.timer}>{formatTimeRemaining(activeBuild.completesAt)}</Text>
          </>
        ) : (
          <Text style={styles.buildText}>Grove is quiet — start a build</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cardDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  cardLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  buildRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buildText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
  },
  delayed: {
    color: "#ef4444",
  },
  timer: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
});
