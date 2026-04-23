import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import GameScene from "@/components/GameScene";
import HUD from "@/components/HUD";
import { useGame } from "@/store/gameStore";

export default function HomeScreen() {
  const { state, dispatch } = useGame();

  return (
    <View style={{ flex: 1 }}>
      <GameScene />
      <HUD />

      {/* Dev-only: Algorithm raid trigger */}
      {__DEV__ && (
        <View style={styles.devControls}>
          <TouchableOpacity
            style={styles.raidBtn}
            onPress={() => dispatch({ type: "ALGORITHM_RAID", minutesOver: 30 })}
          >
            <Text style={styles.raidBtnText}>👁 Simulate Raid</Text>
          </TouchableOpacity>
          {state.algorithmActive && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => dispatch({ type: "CLEAR_ALGORITHM" })}
            >
              <Text style={styles.clearBtnText}>✓ Recover</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  devControls: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 10,
  },
  raidBtn: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  raidBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  clearBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  clearBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
