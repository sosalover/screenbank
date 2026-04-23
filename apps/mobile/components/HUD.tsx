import { View, Text, StyleSheet } from "react-native";
import { useGame, MOCK_SCREEN_TIME, formatTimeRemaining } from "@/store/gameStore";

export default function HUD() {
  const { state } = useGame();
  const activeBuild = state.activeBuilds[0] ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>⏱ {state.minuteBalance} min saved</Text>
      <Text style={styles.sub}>
        📅 {MOCK_SCREEN_TIME.remaining} left today · 🔥 {state.streak} day streak
      </Text>
      {activeBuild ? (
        <Text style={[styles.sub, activeBuild.status === "delayed" && styles.delayed]}>
          {activeBuild.status === "delayed" ? "👁 Delayed: " : "🌱 Building: "}
          {activeBuild.cause.name} · {formatTimeRemaining(activeBuild.completesAt)}
        </Text>
      ) : (
        <Text style={styles.sub}>🌿 Grove is quiet — start a build</Text>
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
  },
  balance: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  sub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
  },
  delayed: {
    color: "#fca5a5",
  },
});
