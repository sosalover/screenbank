import { View } from "react-native";
import { GroveScene } from "@/components/grove/GroveScene";
import HUD from "@/components/HUD";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GroveScene />
      <HUD />
    </View>
  );
}
