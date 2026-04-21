import { View, Text, StyleSheet } from "react-native";
import { useGame } from "@/store/gameStore";

const DEFAULT_ITEMS = [
  { sceneEmoji: "🌳", position: { x: 0.12, y: 0.42 } },
  { sceneEmoji: "🌸", position: { x: 0.72, y: 0.55 } },
];

export default function GameScene() {
  const { state } = useGame();

  return (
    <View style={styles.container}>
      {/* Sky */}
      <View style={styles.sky} />

      {/* Sun */}
      <Text style={styles.sun}>☀️</Text>

      {/* Clouds */}
      <Text style={[styles.cloud, { left: "8%" }]}>☁️</Text>
      <Text style={[styles.cloud, { left: "52%" }]}>☁️</Text>
      <Text style={[styles.cloud, { left: "78%" }]}>☁️</Text>

      {/* Ground */}
      <View style={styles.ground} />

      {/* Default items */}
      {DEFAULT_ITEMS.map((item, i) => (
        <Text
          key={`default-${i}`}
          style={[
            styles.sceneItem,
            { left: `${item.position.x * 100}%`, top: `${item.position.y * 100}%` },
          ]}
        >
          {item.sceneEmoji}
        </Text>
      ))}

      {/* Purchased items */}
      {state.purchasedItems.map((item, i) => (
        <Text
          key={`purchased-${i}`}
          style={[
            styles.sceneItem,
            { left: `${item.position.x * 100}%`, top: `${item.position.y * 100}%` },
          ]}
        >
          {item.sceneEmoji}
        </Text>
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
  sun: {
    position: "absolute",
    top: 18,
    right: 24,
    fontSize: 38,
  },
  cloud: {
    position: "absolute",
    top: 22,
    fontSize: 30,
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
  sceneItem: {
    position: "absolute",
    fontSize: 36,
  },
});
