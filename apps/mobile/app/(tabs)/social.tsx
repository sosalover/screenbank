import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SocialScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-800">Friends</Text>
      <Text className="mt-2 text-gray-500">See what your friends are planting</Text>
    </View>
    </SafeAreaView>
  );
}
