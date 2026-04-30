import "react-native-reanimated";
import "../global.css";
import { Stack, router, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { GameProvider } from "@/store/gameStore";
import { AuthProvider, useAuth } from "@/store/authStore";

function RootNavigator() {
  const { session, loading, budgetMinutes } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session) {
      // Not signed in → welcome
      if (!inAuthGroup) router.replace("/(auth)/welcome");
    } else if (budgetMinutes === null) {
      // Signed in but no budget set → setup
      router.replace("/(auth)/setup");
    } else {
      // Signed in + setup done → app
      if (inAuthGroup) router.replace("/(tabs)");
    }
  }, [session, loading, budgetMinutes, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <GameProvider>
            <RootNavigator />
          </GameProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
