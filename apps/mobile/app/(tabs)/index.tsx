import { View } from "react-native";
import GameScene from "@/components/GameScene";
import HUD from "@/components/HUD";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GameScene />
      <HUD />
    </View>
  );
}
