import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGame, MOCK_SCREEN_TIME, formatTimeRemaining } from "@/store/gameStore";

export default function HUD() {
  const { state } = useGame();
  const activeBuild = state.activeBuilds[0] ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="timer-outline" size={20} color="#fff" />
        <Text style={styles.balance}>{state.minuteBalance} min saved</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="phone-portrait-outline" size={13} color="rgba(255,255,255,0.85)" />
        <Text style={styles.sub}>{MOCK_SCREEN_TIME.remaining} left today</Text>
        <Text style={styles.dot}>·</Text>
        <Ionicons name="flame" size={13} color="rgba(255,255,255,0.85)" />
        <Text style={styles.sub}>{state.streak} day streak</Text>
      </View>
      {activeBuild ? (
        <View style={styles.row}>
          <Ionicons
            name={activeBuild.status === "delayed" ? "eye" : "hammer-outline"}
            size={13}
            color={activeBuild.status === "delayed" ? "#fca5a5" : "rgba(255,255,255,0.85)"}
          />
          <Text style={[styles.sub, activeBuild.status === "delayed" && styles.delayed]}>
            {activeBuild.status === "delayed" ? "Delayed: " : "Building: "}
            {activeBuild.cause.name} · {formatTimeRemaining(activeBuild.completesAt)}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          <Ionicons name="leaf-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={styles.sub}>Grove is quiet — start a build</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balance: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  sub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
  },
  dot: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  delayed: {
    color: "#fca5a5",
  },
});
