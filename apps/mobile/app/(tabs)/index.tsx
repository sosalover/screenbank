import { View } from "react-native";
import { GroveScene } from "@/components/grove/GroveScene";
import HUD from "@/components/HUD";
import { TutorialOverlay } from "@/components/grove/TutorialOverlay";
import { useGame } from "@/store/gameStore";

export default function HomeScreen() {
  const { state } = useGame();

  return (
    <View style={{ flex: 1 }}>
      <GroveScene />
      <HUD />
      {!state.tutorialComplete && <TutorialOverlay />}
    </View>
  );
}
