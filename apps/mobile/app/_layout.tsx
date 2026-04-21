import "../global.css";
import { Stack } from "expo-router";
import { GameProvider } from "@/store/gameStore";

export default function RootLayout() {
  return (
    <GameProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GameProvider>
  );
}
