import { View, Text, StyleSheet } from "react-native";
import { useGame, MOCK_SCREEN_TIME } from "@/store/gameStore";

export default function HUD() {
  const { state } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.tokens}>🪙 {state.tokenBalance} tokens</Text>
      <Text style={styles.sub}>
        ⏱ {MOCK_SCREEN_TIME.remaining} left today · +{MOCK_SCREEN_TIME.potentialTokens} potential
      </Text>
      <Text style={styles.sub}>📊 Avg: {MOCK_SCREEN_TIME.avgScreenTime} / day</Text>
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
  tokens: {
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
});
