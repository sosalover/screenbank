import { View } from "react-native";
import { GroveScene } from "@/components/grove/GroveScene";
import HUD from "@/components/HUD";
import { useScreenTime } from "@/hooks/useScreenTime";

export default function HomeScreen() {
  useScreenTime(); // handles auth + claiming earnings on foreground
  return (
    <View style={{ flex: 1 }}>
      <GroveScene />
      <HUD />
    </View>
  );
}
