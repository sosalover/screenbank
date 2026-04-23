import { View, Text, StyleSheet } from "react-native";
import { useGame, formatTimeRemaining } from "@/store/gameStore";

const DEFAULT_ITEMS = [
  { emoji: "🌳", position: { x: 0.12, y: 0.42 } },
  { emoji: "🌸", position: { x: 0.72, y: 0.55 } },
];

export default function GameScene() {
  const { state } = useGame();

  return (
    <View style={styles.container}>
      {/* Sky */}
      <View style={styles.sky} />

      {/* Algorithm overlay */}
      {state.algorithmActive && <View style={styles.algorithmOverlay} />}

      {/* Sun */}
      <Text style={styles.sun}>{state.algorithmActive ? "🌑" : "☀️"}</Text>

      {/* Clouds */}
      <Text style={[styles.cloud, { left: "8%" }]}>☁️</Text>
      <Text style={[styles.cloud, { left: "52%" }]}>☁️</Text>
      <Text style={[styles.cloud, { left: "78%" }]}>☁️</Text>

      {/* Algorithm raid message */}
      {state.algorithmActive && (
        <View style={styles.raidBanner}>
          <Text style={styles.raidText}>👁 You fed me today.</Text>
        </View>
      )}

      {/* Ground */}
      <View
        style={[styles.ground, state.algorithmActive && styles.groundDark]}
      />

      {/* Default items */}
      {DEFAULT_ITEMS.map((item, i) => (
        <Text
          key={`default-${i}`}
          style={[
            styles.sceneItem,
            {
              left: `${item.position.x * 100}%`,
              top: `${item.position.y * 100}%`,
            },
          ]}
        >
          {item.emoji}
        </Text>
      ))}

      {/* Completed builds */}
      {state.completedBuilds.map((build, i) => (
        <Text
          key={`complete-${i}`}
          style={[
            styles.sceneItem,
            {
              left: `${build.position.x * 100}%`,
              top: `${build.position.y * 100}%`,
            },
          ]}
        >
          {build.cause.completedEmoji}
        </Text>
      ))}

      {/* Active builds — faded with timer */}
      {state.activeBuilds.map((build, i) => (
        <View
          key={`active-${i}`}
          style={[
            styles.activeBuildContainer,
            {
              left: `${build.position.x * 100}%`,
              top: `${build.position.y * 100}%`,
            },
          ]}
        >
          <Text style={styles.sceneItemFaded}>{build.cause.emoji}</Text>
          <View
            style={[
              styles.timerBadge,
              build.status === "delayed" && styles.timerBadgeDelayed,
            ]}
          >
            <Text style={styles.timerText}>
              {build.status === "delayed" ? "⏸" : "⏳"}{" "}
              {formatTimeRemaining(build.completesAt)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#87CEEB",
  },
  algorithmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 1,
  },
  sun: {
    position: "absolute",
    top: 18,
    right: 24,
    fontSize: 38,
    zIndex: 2,
  },
  cloud: {
    position: "absolute",
    top: 22,
    fontSize: 30,
    zIndex: 2,
  },
  raidBanner: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  raidText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: "#4ade80",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  groundDark: {
    backgroundColor: "#166534",
  },
  sceneItem: {
    position: "absolute",
    fontSize: 36,
    zIndex: 2,
  },
  sceneItemFaded: {
    fontSize: 36,
    opacity: 0.45,
  },
  activeBuildContainer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 2,
  },
  timerBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  timerBadgeDelayed: {
    backgroundColor: "rgba(220,38,38,0.8)",
  },
  timerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
